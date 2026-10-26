package com.example.elovia.auth

import com.example.elovia.BuildConfig
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.io.OutputStream
import java.net.HttpURLConnection
import java.net.URI
import java.net.SocketTimeoutException
import java.net.URISyntaxException
import java.net.URL

class ApiException(
    message: String,
    val statusCode: Int? = null,
    cause: Throwable? = null
) : Exception(message, cause)

internal class ApiClient {
    private val baseUrl = BuildConfig.API_BASE_URL.trim().trimEnd('/').removeSuffix("/api")

    fun request(
        method: String,
        path: String,
        body: JSONObject? = null,
        token: String? = null
    ): JSONObject {
        val configuredBaseUrl = validateBaseUrl()
        val normalizedPath = path.trim().trim('/').let { requestPath ->
            when {
                requestPath.equals("api", ignoreCase = true) -> ""
                requestPath.startsWith("api/", ignoreCase = true) -> requestPath.substring(4)
                else -> requestPath
            }
        }
        if (normalizedPath.isBlank()) {
            throw ApiException("The requested API path is missing.")
        }
        val connection = try {
            URL("$configuredBaseUrl/api/$normalizedPath").openConnection() as HttpURLConnection
        } catch (error: IOException) {
            throw ApiException("Couldn't connect to Elovia Love. Check your connection and try again.", cause = error)
        }

        try {
            connection.requestMethod = method
            connection.connectTimeout = 15_000
            connection.readTimeout = 15_000
            connection.setRequestProperty("Accept", "application/json")
            connection.setRequestProperty("Content-Type", "application/json; charset=utf-8")
            if (!token.isNullOrBlank()) {
                connection.setRequestProperty("Authorization", "Bearer $token")
            }
            if (!token.isNullOrBlank()) {
                connection.setRequestProperty("Authorization", "Bearer " + token)
            }
            if (body != null) {
                connection.doOutput = true
                connection.outputStream.use { output ->
                    output.write(body.toString().toByteArray(Charsets.UTF_8))
                }
            }

            val status = connection.responseCode
            val stream = if (status in 200..299) connection.inputStream else connection.errorStream
            val responseText = stream?.use { readBounded(it) }.orEmpty()
            val response = try {
                JSONObject(responseText)
            } catch (error: JSONException) {
                throw ApiException("The server returned an unexpected response.", status, error)
            }

            if (status !in 200..299) {
                throw ApiException(errorMessage(response), status)
            }
            return response
        } catch (error: SocketTimeoutException) {
            throw ApiException("The connection timed out. Please try again.", cause = error)
        } catch (error: IOException) {
            throw ApiException("Couldn't connect to Elovia Love. Check your connection and try again.", cause = error)
        } finally {
            connection.disconnect()
        }
    }

    fun uploadPhoto(
        path: String,
        fileName: String,
        mimeType: String,
        content: ByteArray,
        token: String
    ): JSONObject {
        val configuredBaseUrl = validateBaseUrl()
        val normalizedPath = path.trim().trim('/').let { requestPath ->
            if (requestPath.startsWith("api/", ignoreCase = true)) requestPath.substring(4) else requestPath
        }
        if (normalizedPath.isBlank()) {
            throw ApiException("The requested API path is missing.")
        }

        val connection = try {
            URL("$configuredBaseUrl/api/$normalizedPath").openConnection() as HttpURLConnection
        } catch (error: IOException) {
            throw ApiException("Couldn't connect to Elovia Love. Check your connection and try again.", cause = error)
        }
        val boundary = "EloviaLove-${System.currentTimeMillis()}"
        try {
            connection.requestMethod = "POST"
            connection.connectTimeout = 15_000
            connection.readTimeout = 30_000
            connection.doOutput = true
            connection.setRequestProperty("Accept", "application/json")
            connection.setRequestProperty("Authorization", "Bearer " + token)
            connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=$boundary")
            connection.outputStream.use { output ->
                writeMultipartPhoto(output, boundary, fileName, mimeType, content)
            }

            val status = connection.responseCode
            val stream = if (status in 200..299) connection.inputStream else connection.errorStream
            val responseText = stream?.use { readBounded(it) }.orEmpty()
            val response = try {
                JSONObject(responseText)
            } catch (error: JSONException) {
                throw ApiException("The server returned an unexpected response.", status, error)
            }
            if (status !in 200..299) {
                throw ApiException(errorMessage(response), status)
            }
            return response
        } catch (error: SocketTimeoutException) {
            throw ApiException("The connection timed out. Please try again.", cause = error)
        } catch (error: IOException) {
            throw ApiException("Couldn't connect to Elovia Love. Check your connection and try again.", cause = error)
        } finally {
            connection.disconnect()
        }
    }

    private fun writeMultipartPhoto(
        output: OutputStream,
        boundary: String,
        fileName: String,
        mimeType: String,
        content: ByteArray
    ) {
        val safeFileName = fileName.replace("\"", "")
        output.write("--$boundary\r\n".toByteArray(Charsets.UTF_8))
        output.write(
            "Content-Disposition: form-data; name=\"photo\"; filename=\"$safeFileName\"\r\n".toByteArray(Charsets.UTF_8)
        )
        output.write("Content-Type: $mimeType\r\n\r\n".toByteArray(Charsets.UTF_8))
        output.write(content)
        output.write("\r\n--$boundary--\r\n".toByteArray(Charsets.UTF_8))
    }

    private fun validateBaseUrl(): String {
        if (baseUrl.isBlank()) {
            throw ApiException(
                "The app isn't configured with a backend URL. Set ELOVIA_API_BASE_URL and rebuild."
            )
        }

        val uri = try {
            URI(baseUrl)
        } catch (error: URISyntaxException) {
            throw ApiException("The configured backend URL is invalid.", cause = error)
        }
        val host = uri.host?.lowercase()
        val localHost = host == "localhost" ||
            host == "127.0.0.1" ||
            host == "10.0.2.2" ||
            host == "::1" ||
            host?.startsWith("192.168.") == true ||
            host?.startsWith("10.") == true ||
            host?.matches(Regex("""172\.(1[6-9]|2[0-9]|3[0-1])\..+""")) == true

        if (uri.userInfo != null || uri.query != null || uri.fragment != null ||
            (uri.scheme != "https" && !(uri.scheme == "http" && localHost)) ||
            host.isNullOrBlank()
        ) {
            throw ApiException("Use an HTTPS backend URL, or HTTP only for a local development server.")
        }
        return baseUrl
    }

    private fun readBounded(input: java.io.InputStream): String {
        val output = ByteArrayOutputStream()
        val buffer = ByteArray(8_192)
        var total = 0
        while (true) {
            val count = input.read(buffer)
            if (count < 0) break
            total += count
            if (total > MAX_RESPONSE_BYTES) {
                throw ApiException("The server response was too large to process.")
            }
            output.write(buffer, 0, count)
        }
        return output.toString(Charsets.UTF_8.name())
    }

    private fun errorMessage(response: JSONObject): String {
        val message = response.optString("message").trim()
        if (message.isNotEmpty()) return message

        val errors: JSONArray = response.optJSONArray("errors") ?: return "Something went wrong. Please try again."
        return errors.optJSONObject(0)?.optString("msg")?.takeIf(String::isNotBlank)
            ?: "Please check your details and try again."
    }

    private companion object {
        const val MAX_RESPONSE_BYTES = 1_048_576
    }
}
