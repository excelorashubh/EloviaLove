package com.example.elovia.auth

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import java.io.IOException
import java.security.GeneralSecurityException
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec

class SessionStorageException(cause: Throwable) :
    Exception("Couldn't securely save or restore your session. Please try again.", cause)

internal class SecureSessionStore(context: Context) {
    private val preferences = context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)

    fun readToken(): String? {
        val encrypted = preferences.getString(TOKEN, null) ?: return null
        try {
            val parts = encrypted.split('.', limit = 2)
            if (parts.size != 2) throw GeneralSecurityException("Invalid encrypted session data")
            val iv = Base64.decode(parts[0], Base64.NO_WRAP)
            val ciphertext = Base64.decode(parts[1], Base64.NO_WRAP)
            val cipher = Cipher.getInstance(TRANSFORMATION)
            cipher.init(Cipher.DECRYPT_MODE, getKey(), GCMParameterSpec(TAG_LENGTH, iv))
            return cipher.doFinal(ciphertext).toString(Charsets.UTF_8)
        } catch (error: GeneralSecurityException) {
            throw SessionStorageException(error)
        } catch (error: IOException) {
            throw SessionStorageException(error)
        } catch (error: IllegalArgumentException) {
            throw SessionStorageException(error)
        }
    }

    fun saveToken(token: String) {
        try {
            val cipher = Cipher.getInstance(TRANSFORMATION)
            cipher.init(Cipher.ENCRYPT_MODE, getKey())
            val iv = Base64.encodeToString(cipher.iv, Base64.NO_WRAP)
            val ciphertext = Base64.encodeToString(cipher.doFinal(token.toByteArray(Charsets.UTF_8)), Base64.NO_WRAP)
            if (!preferences.edit().putString(TOKEN, "$iv.$ciphertext").commit()) {
                throw GeneralSecurityException("Session preferences could not be written")
            }
        } catch (error: GeneralSecurityException) {
            throw SessionStorageException(error)
        } catch (error: IOException) {
            throw SessionStorageException(error)
        }
    }

    fun clear() {
        if (!preferences.edit().remove(TOKEN).commit()) {
            throw SessionStorageException(GeneralSecurityException("Session preferences could not be cleared"))
        }
    }

    private fun getKey(): SecretKey {
        val keyStore = KeyStore.getInstance(ANDROID_KEY_STORE).apply { load(null) }
        (keyStore.getKey(KEY_ALIAS, null) as? SecretKey)?.let { return it }

        val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEY_STORE)
        keyGenerator.init(
            KeyGenParameterSpec.Builder(
                KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setRandomizedEncryptionRequired(true)
                .build()
        )
        return keyGenerator.generateKey()
    }

    private companion object {
        const val PREFERENCES = "secure_session"
        const val TOKEN = "encrypted_token"
        const val KEY_ALIAS = "elovia_session_key"
        const val ANDROID_KEY_STORE = "AndroidKeyStore"
        const val TRANSFORMATION = "AES/GCM/NoPadding"
        const val TAG_LENGTH = 128
    }
}
