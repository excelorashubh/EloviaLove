package com.example.elovia.auth

import android.content.Context
import com.example.elovia.BuildConfig
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONException
import org.json.JSONObject
import java.net.URISyntaxException

data class AuthUser(
    val id: String,
    val name: String,
    val email: String,
    val profilePhoto: String = "",
    val bio: String = "",
    val location: String = "",
    val interests: List<String> = emptyList(),
    val relationshipGoals: String = "",
    val age: Int? = null,
    val isVerified: Boolean = false,
    val profileCompleted: Boolean = false,
    val plan: String = "free",
    val dateOfBirth: String = "",
    val gender: String = "",
    val phone: String = "",
    val phoneVerified: Boolean = false,
    val emailVerified: Boolean = false,
    val blueTickStatus: String = "none",
    val education: String = "",
    val profession: String = "",
    val height: Int? = null,
    val income: String = "",
    val religion: String = "",
    val smoking: String = "",
    val drinking: String = ""
)

data class AuthSession(val user: AuthUser)

sealed class SessionRestore {
    data class Authenticated(val session: AuthSession) : SessionRestore()
    object Unauthenticated : SessionRestore()
    data class Unavailable(val message: String) : SessionRestore()
}

class AuthRepository(context: Context) {
    private val api = ApiClient()
    private val sessionStore = SecureSessionStore(context.applicationContext)

    fun restoreSession(): SessionRestore {
        val token = try {
            sessionStore.readToken()
        } catch (error: SessionStorageException) {
            return SessionRestore.Unavailable(error.message ?: "Couldn't restore the saved session.")
        } ?: return SessionRestore.Unauthenticated

        return try {
            val response = api.request("GET", "/auth/me", token = token)
            SessionRestore.Authenticated(parseUser(response))
        } catch (error: ApiException) {
            if (error.statusCode == 401) {
                try {
                    sessionStore.clear()
                    SessionRestore.Unauthenticated
                } catch (storageError: SessionStorageException) {
                    SessionRestore.Unavailable(storageError.message ?: "Couldn't clear the expired session.")
                }
            } else {
                SessionRestore.Unavailable(error.message ?: "Couldn't verify your session.")
            }
        } catch (error: JSONException) {
            SessionRestore.Unavailable("The server returned an unexpected response.")
        }
    }

    fun login(email: String, password: String): AuthSession =
        authenticate(
            JSONObject()
                .put("email", email.trim())
                .put("password", password)
        )

    fun register(
        name: String,
        email: String,
        password: String,
        dateOfBirth: String,
        gender: String
    ): AuthSession = authenticate(
        body = JSONObject()
            .put("name", name.trim())
            .put("email", email.trim())
            .put("password", password)
            .put("dateOfBirth", dateOfBirth)
            .put("gender", gender),
        path = "/auth/register"
    )

    fun logout() {
        sessionStore.clear()
    }

    fun getDiscover(page: Int = 1): JSONObject =
        authenticatedRequest("GET", "/users/discover?page=$page")

    fun filterDiscover(
        ageMin: Int? = null,
        ageMax: Int? = null,
        gender: String? = null,
        location: String? = null,
        onlineOnly: Boolean = false
    ): JSONObject {
        val filters = JSONObject()
        ageMin?.let { filters.put("ageMin", it) }
        ageMax?.let { filters.put("ageMax", it) }
        gender?.let { filters.put("gender", it) }
        location?.let { filters.put("location", it) }
        if (onlineOnly) filters.put("onlineOnly", true)
        return authenticatedRequest("POST", "/match/filter", filters)
    }

    fun getCurrentUser(): JSONObject = authenticatedRequest("GET", "/auth/me")

    fun parseCurrentUser(response: JSONObject): AuthUser = parseUser(response).user

    fun swipe(userId: String, action: String): JSONObject {
        requireValidId(userId)
        require(action == "like" || action == "pass") { "Swipe action must be like or pass." }
        return authenticatedRequest(
            "POST",
            "/match/swipe",
            JSONObject().put("targetUserId", userId).put("action", action)
        )
    }

    fun getMatches(): JSONObject = authenticatedRequest("GET", "/matches")

    fun getConversations(): JSONObject = authenticatedRequest("GET", "/messages")

    fun getNotifications(): JSONObject = authenticatedRequest("GET", "/notifications?page=1")

    fun getSubscriptionStatus(): JSONObject = authenticatedRequest("GET", "/subscription/status")

    fun getSubscriptionPlans(): JSONObject = api.request("GET", "/subscription/plans")

    fun getMessages(userId: String): JSONObject {
        requireValidId(userId)
        return authenticatedRequest("GET", "/messages/$userId?page=1")
    }

    fun sendMessage(userId: String, content: String, clientMessageId: String): JSONObject {
        requireValidId(userId)
        return authenticatedRequest(
            "POST",
            "/messages/$userId",
            JSONObject()
                .put("content", content)
                .put("clientMessageId", clientMessageId)
        )
    }

    fun markMessagesRead(userId: String): JSONObject {
        requireValidId(userId)
        return authenticatedRequest("POST", "/messages/$userId/read")
    }

    fun createAuthenticatedSocket(): Socket {
        val token = sessionStore.readToken()
            ?: throw ApiException("Your session has expired. Please sign in again.", 401)
        val backendUrl = BuildConfig.API_BASE_URL.trim().trimEnd('/').removeSuffix("/api")
        val options = IO.Options().apply {
            auth = mapOf("token" to token)
            reconnection = true
            reconnectionAttempts = Int.MAX_VALUE
            reconnectionDelay = 1_000
            reconnectionDelayMax = 30_000
            timeout = 20_000
        }
        return try {
            IO.socket(backendUrl, options)
        } catch (error: URISyntaxException) {
            throw ApiException("The configured chat server URL is invalid.", cause = error)
        }
    }

    fun updateProfile(
        name: String,
        bio: String,
        location: String,
        interests: List<String>,
        goals: String,
        education: String,
        profession: String,
        height: Int?,
        income: String,
        religion: String,
        smoking: String,
        drinking: String
    ): JSONObject {
        val lifestyle = JSONObject()
            .put("smoking", smoking)
            .put("drinking", drinking)
        val body = JSONObject()
            .put("name", name.trim())
            .put("bio", bio.trim())
            .put("location", location.trim())
            .put("interests", org.json.JSONArray(interests))
            .put("relationshipGoals", goals)
            .put("education", education)
            .put("profession", profession)
            .put("height", height)
            .put("income", income)
            .put("religion", religion)
            .put("lifestyle", lifestyle)
        return authenticatedRequest("PUT", "/users/profile", body)
    }

    fun uploadProfilePhoto(fileName: String, mimeType: String, content: ByteArray): JSONObject {
        val token = sessionStore.readToken()
            ?: throw ApiException("Your session has expired. Please sign in again.", 401)
        return api.uploadPhoto("/users/upload-photo", fileName, mimeType, content, token)
    }

    private fun authenticatedRequest(method: String, path: String, body: JSONObject? = null): JSONObject {
        val token = sessionStore.readToken()
            ?: throw ApiException("Your session has expired. Please sign in again.", 401)
        return api.request(method, path, body, token)
    }

    private fun authenticate(body: JSONObject, path: String = "/auth/login"): AuthSession {
        try {
            val response = api.request("POST", path, body)
            if (!response.optBoolean("success")) {
                throw ApiException(response.optString("message").ifBlank { "Authentication failed. Please try again." })
            }

            val token = response.optString("token").takeIf(String::isNotBlank)
                ?: throw ApiException("The server didn't return a valid session.")
            val session = parseUser(response)
            sessionStore.saveToken(token)
            return session
        } catch (error: JSONException) {
            throw ApiException("The server returned an unexpected response.", cause = error)
        }
    }

    private fun parseUser(response: JSONObject): AuthSession {
        val user = response.optJSONObject("user")
            ?: throw JSONException("Missing user")
        val id = user.optString("id").takeIf(String::isNotBlank)
            ?: throw JSONException("Missing user id")
        return AuthSession(
            AuthUser(
                id = id,
                name = user.optString("name").ifBlank { "there" },
                email = user.optString("email"),
                profilePhoto = user.optString("profilePhoto")
                    .takeIf { it.isNotBlank() && it != "null" }
                    .orEmpty(),
                bio = user.optString("bio"),
                location = user.optString("location"),
                interests = user.optJSONArray("interests")?.let { values ->
                    (0 until values.length()).mapNotNull { index ->
                        values.optString(index).takeIf(String::isNotBlank)
                    }
                } ?: emptyList(),
                relationshipGoals = user.optString("relationshipGoals"),
                age = user.optInt("age").takeIf { user.has("age") && !user.isNull("age") },
                isVerified = user.optBoolean("isVerified"),
                profileCompleted = user.optBoolean("profileCompleted"),
                plan = user.optString("plan").ifBlank { "free" },
                dateOfBirth = user.optString("dateOfBirth").takeUnless { it == "null" }.orEmpty(),
                gender = user.optString("gender"),
                phone = user.optString("phone").takeUnless { it == "null" }.orEmpty(),
                phoneVerified = user.optBoolean("phoneVerified"),
                emailVerified = user.optBoolean("emailVerified"),
                blueTickStatus = user.optString("blueTickStatus").ifBlank { "none" },
                education = user.optString("education"),
                profession = user.optString("profession"),
                height = user.optInt("height").takeIf { user.has("height") && !user.isNull("height") },
                income = user.optString("income"),
                religion = user.optString("religion"),
                smoking = user.optJSONObject("lifestyle")?.optString("smoking").orEmpty(),
                drinking = user.optJSONObject("lifestyle")?.optString("drinking").orEmpty()
            )
        )
    }

    private fun requireValidId(id: String) {
        require(id.matches(Regex("[a-fA-F0-9]{24}"))) { "The server returned an invalid user ID." }
    }
}
