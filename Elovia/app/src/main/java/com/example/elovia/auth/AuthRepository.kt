package com.example.elovia.auth

import android.content.Context
import org.json.JSONException
import org.json.JSONObject

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
    val profileCompleted: Boolean = false
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

    fun sendMessage(userId: String, content: String): JSONObject {
        requireValidId(userId)
        return authenticatedRequest(
            "POST",
            "/messages/$userId",
            JSONObject().put("content", content)
        )
    }

    fun updateProfile(name: String, bio: String, location: String, interests: List<String>, goals: String): JSONObject =
        authenticatedRequest(
            "PUT",
            "/users/profile",
            JSONObject()
                .put("name", name.trim())
                .put("bio", bio.trim())
                .put("location", location.trim())
                .put("interests", org.json.JSONArray(interests))
                .put("relationshipGoals", goals)
        )

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
                profileCompleted = user.optBoolean("profileCompleted")
            )
        )
    }

    private fun requireValidId(id: String) {
        require(id.matches(Regex("[a-fA-F0-9]{24}"))) { "The server returned an invalid user ID." }
    }
}
