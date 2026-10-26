package com.example.elovia

import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.drawable.Drawable
import android.net.Uri
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Handler
import android.os.Looper
import android.text.Editable
import android.text.TextWatcher
import android.text.format.DateUtils
import android.view.Gravity
import android.view.KeyEvent
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.ImageView
import android.widget.ImageButton
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import android.util.Base64
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.content.ContextCompat
import com.bumptech.glide.Glide
import com.bumptech.glide.load.DataSource
import com.bumptech.glide.load.engine.GlideException
import com.bumptech.glide.load.resource.bitmap.CircleCrop
import com.bumptech.glide.request.RequestListener
import com.bumptech.glide.request.target.Target
import com.example.elovia.BuildConfig
import com.example.elovia.auth.ApiException
import com.example.elovia.auth.AuthRepository
import com.example.elovia.auth.AuthUser
import com.example.elovia.auth.SessionStorageException
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputLayout
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.io.ByteArrayOutputStream
import java.net.URI
import java.net.URISyntaxException
import java.time.Instant
import java.time.format.DateTimeParseException
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

internal class AuthenticatedAppView(
    context: Context,
    private var user: AuthUser,
    private val repository: AuthRepository,
    private val onRequestPhoto: () -> Unit,
    private val onLogout: () -> Unit,
    private val onSessionExpired: () -> Unit
) : LinearLayout(context) {
    private enum class Tab(val id: Int, val label: String, val icon: Int) {
        HOME(1, "Home", R.drawable.ic_nav_home),
        DISCOVER(2, "Discover", R.drawable.ic_nav_discover),
        MATCHES(3, "Likes", R.drawable.ic_nav_matches),
        CHATS(4, "Chats", R.drawable.ic_nav_chats),
        PROFILE(5, "Profile", R.drawable.ic_nav_profile)
    }

    private val IVORY get() = ContextCompat.getColor(context, R.color.app_background)
    private val ROSE get() = ContextCompat.getColor(context, R.color.brand_end)
    private val PLUM get() = ContextCompat.getColor(context, R.color.brand_text)
    private val CHARCOAL get() = ContextCompat.getColor(context, R.color.app_text_primary)
    private val MUTED get() = ContextCompat.getColor(context, R.color.app_text_secondary)
    private val PALE_ROSE get() = ContextCompat.getColor(context, R.color.app_tint)
    private val SURFACE get() = ContextCompat.getColor(context, R.color.app_surface)
    private val ON_ACCENT get() = ContextCompat.getColor(context, R.color.app_on_accent)
    private val HOME_PRIMARY get() = ContextCompat.getColor(context, R.color.home_primary)
    private val HOME_SECONDARY get() = ContextCompat.getColor(context, R.color.home_secondary)
    private val HOME_DIVIDER get() = ContextCompat.getColor(context, R.color.home_divider)
    private val io: ExecutorService = Executors.newFixedThreadPool(2)
    private val mainHandler = Handler(Looper.getMainLooper())
    private val body = LinearLayout(context).apply { orientation = VERTICAL }
    private val header = LinearLayout(context).apply {
        orientation = HORIZONTAL
        gravity = Gravity.CENTER_VERTICAL
        setPadding(dp(22), dp(12), dp(22), dp(12))
    }
    private val scroll = ScrollView(context).apply {
        isFillViewport = true
        clipToPadding = false
        setBackgroundColor(IVORY)
    }
    private val navigation = BottomNavigationView(context)
    private val chatComposer = LinearLayout(context).apply {
        orientation = HORIZONTAL
        gravity = Gravity.CENTER_VERTICAL
        setPadding(dp(14), dp(8), dp(14), dp(8))
        background = rounded(SURFACE, 0)
        visibility = GONE
    }
    private var selectedTab = Tab.HOME
    private var chatUser: JSONObject? = null
    private var currentScreen = "tab"
    private var discoverProfiles = JSONArray()
    private var activeProfileIndex = 0
    private var matches = JSONArray()
    private var conversations = JSONArray()
    private var messages = JSONArray()
    private var notifications = JSONArray()
    private var subscriptionPlans = JSONArray()
    private var subscriptionStatus = JSONObject()
    private var loading = false
    private var loadError: String? = null
    private var isSendingMessage = false
    private var isUploadingPhoto = false
    private var skipInitialHomeProfileRefresh = true
    private var focusedDiscoverProfileId: String? = null
    private var homeError: String? = null
    private var unreadNotificationCount = 0

    init {
        orientation = VERTICAL
        setBackgroundColor(IVORY)
        body.setPadding(dp(22), dp(4), dp(22), dp(24))
        addView(header, LayoutParams(MATCH_PARENT, dp(68)))
        addView(scroll, LayoutParams(MATCH_PARENT, 0, 1f))
        addView(chatComposer, LayoutParams(MATCH_PARENT, WRAP_CONTENT))
        addView(navigation, LayoutParams(MATCH_PARENT, WRAP_CONTENT))
        navigation.menu.apply {
            Tab.entries.forEach { tab ->
                add(0, tab.id, tab.ordinal, tab.label).apply {
                    setIcon(tab.icon)
                    isCheckable = true
                }
            }
        }
        val navColors = ColorStateList(
            arrayOf(intArrayOf(android.R.attr.state_checked), intArrayOf()),
            intArrayOf(ROSE, HOME_SECONDARY)
        )
        navigation.itemIconTintList = navColors
        navigation.itemTextColor = navColors
        navigation.background = rounded(SURFACE, 0)
        navigation.labelVisibilityMode = BottomNavigationView.LABEL_VISIBILITY_LABELED
        navigation.selectedItemId = Tab.HOME.id
        updateNavigationBadges()
        navigation.setOnItemSelectedListener { item ->
            val tab = Tab.entries.firstOrNull { it.id == item.itemId } ?: return@setOnItemSelectedListener false
            selectedTab = tab
            currentScreen = "tab"
            chatUser = null
            loadError = null
            loading = true
            renderHeader()
            renderTab()
            loadTab()
            true
        }
        ViewCompat.setOnApplyWindowInsetsListener(this) { view, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            view.setPadding(0, bars.top, 0, 0)
            navigation.setPadding(0, 0, 0, bars.bottom)
            chatComposer.setPadding(dp(14), dp(8), dp(14), dp(8) + bars.bottom)
            insets
        }
        renderHeader()
        loading = true
        renderTab()
        post {
            if (isAttachedToWindow) loadTab()
        }
    }

    fun handleBack(): Boolean {
        if (currentScreen == "chat") {
            chatUser = null
            currentScreen = "tab"
            renderHeader()
            loadTab()
            return true
        }
        if (currentScreen == "edit") {
            currentScreen = "tab"
            selectedTab = Tab.PROFILE
            navigation.selectedItemId = Tab.PROFILE.id
            renderHeader()
            renderTab()
            return true
        }
        if (currentScreen != "tab") {
            currentScreen = "tab"
            selectedTab = Tab.PROFILE
            navigation.selectedItemId = Tab.PROFILE.id
            renderHeader()
            renderTab()
            return true
        }
        if (selectedTab != Tab.HOME) {
            navigation.selectedItemId = Tab.HOME.id
            return true
        }
        return false
    }

    override fun onDetachedFromWindow() {
        io.shutdownNow()
        super.onDetachedFromWindow()
    }

    private fun renderHeader() {
        header.removeAllViews()
        if (currentScreen == "tab" && selectedTab == Tab.HOME) {
            header.setPadding(dp(16), dp(10), dp(16), dp(10))
            val logo = ImageView(context).apply {
                setImageResource(R.drawable.elovia_love_logo)
                contentDescription = "Elovia Love"
                scaleType = ImageView.ScaleType.FIT_CENTER
            }
            header.addView(logo, LayoutParams(dp(42), dp(42)))
            addLabel(header, "Elovia Love", 20, HOME_PRIMARY, true).apply {
                typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
                setPadding(dp(8), 0, 0, 0)
                header.addView(this, LayoutParams(0, WRAP_CONTENT, 1f))
            }
            header.addView(notificationButton())
            addAvatar(header, user.profilePhoto, user.name, 42).apply {
                contentDescription = "Open profile"
                isClickable = true
                isFocusable = true
                setOnClickListener { navigation.selectedItemId = Tab.PROFILE.id }
            }
            return
        }
        header.setPadding(dp(22), dp(12), dp(22), dp(12))
        if (currentScreen == "chat" && chatUser != null) {
            header.addView(iconButton(R.drawable.ic_arrow_back, "Back to chats") {
                handleBack()
            }, LayoutParams(dp(48), dp(48)).apply { marginEnd = dp(6) })
            addAvatar(header, chatUser!!.optString("profilePhoto"), chatUser!!.optString("name"), 40)
            val personDetails = LinearLayout(context).apply {
                orientation = VERTICAL
                gravity = Gravity.CENTER_VERTICAL
            }
            addLabel(personDetails, chatUser!!.optString("name").ifBlank { "Elovia member" }, 17, CHARCOAL, true).apply {
                maxLines = 1
                ellipsize = android.text.TextUtils.TruncateAt.END
                personDetails.addView(this)
            }
            val lastActive = lastActiveLabel(chatUser!!)
            if (lastActive.isNotBlank()) addLabel(personDetails, lastActive, 12, MUTED, false)
                .also { personDetails.addView(it) }
            header.addView(personDetails, LayoutParams(0, WRAP_CONTENT, 1f))
            return
        }
        if (currentScreen == "notifications" || currentScreen == "membership" || currentScreen == "settings") {
            header.addView(smallButton("‹") { handleBack() }, LayoutParams(dp(44), dp(44)))
            val pageTitle = when (currentScreen) {
                "notifications" -> "Notifications"
                "membership" -> "Membership"
                else -> "Settings"
            }
            addLabel(header, pageTitle, 19, CHARCOAL, true).also {
                it.setPadding(dp(10), 0, 0, 0)
                header.addView(it, LayoutParams(0, WRAP_CONTENT, 1f))
            }
            return
        }
        addLabel(header, "♥", 22, ROSE, true).also {
            it.gravity = Gravity.CENTER
            it.background = rounded(PALE_ROSE, 15)
            header.addView(it, LayoutParams(dp(42), dp(42)))
        }
        val titles = when (currentScreen) {
            "edit" -> "Edit profile"
            else -> "Elovia Love"
        }
        addLabel(header, titles, 20, PLUM, true).also {
            it.setPadding(dp(11), 0, 0, 0)
            header.addView(it, LayoutParams(0, WRAP_CONTENT, 1f))
        }
        if (currentScreen == "tab" && selectedTab == Tab.HOME) {
            addAvatar(header, user.profilePhoto, user.name, 42)
        } else if (currentScreen == "edit") {
            header.addView(smallButton("Cancel") {
                currentScreen = "tab"
                renderHeader()
                renderTab()
            })
        }
    }

    private fun loadTab() {
        if (currentScreen == "edit") {
            renderEditProfile()
            return
        }
        if (currentScreen == "chat") {
            loadChat()
            return
        }
        if (currentScreen != "tab") {
            loadAuxiliaryScreen()
            return
        }
        loading = true
        loadError = null
        renderTab()
        io.execute {
            try {
                when (selectedTab) {
                    Tab.HOME -> {
                        val profileResponse = if (skipInitialHomeProfileRefresh) {
                            skipInitialHomeProfileRefresh = false
                            null
                        } else {
                            repository.getCurrentUser()
                        }
                        val requestErrors = mutableListOf<Exception>()
                        val discovered = try {
                            repository.getDiscover()
                        } catch (error: Exception) {
                            requestErrors.add(error)
                            null
                        }
                        val chatResponse = try {
                            repository.getConversations()
                        } catch (error: Exception) {
                            requestErrors.add(error)
                            null
                        }
                        val matchesResponse = try {
                            repository.getMatches()
                        } catch (error: Exception) {
                            requestErrors.add(error)
                            null
                        }
                        val notificationsResponse = try {
                            repository.getNotifications()
                        } catch (error: Exception) {
                            requestErrors.add(error)
                            null
                        }
                        mainHandler.post {
                            if (!isAttachedToWindow) return@post
                            val authError = requestErrors.firstOrNull {
                                it is ApiException && it.statusCode == 401
                            }
                            if (authError != null) {
                                loading = false
                                showError(authError)
                                return@post
                            }
                            if (profileResponse != null) {
                                user = repository.parseCurrentUser(profileResponse)
                            }
                            discoverProfiles = discovered?.optJSONArray("users") ?: JSONArray()
                            conversations = chatResponse?.optJSONArray("conversations") ?: JSONArray()
                            matches = matchesResponse?.optJSONArray("matches") ?: JSONArray()
                            notifications = notificationsResponse?.optJSONArray("notifications") ?: JSONArray()
                            unreadNotificationCount = notificationsResponse?.optInt("unreadCount") ?: 0
                            homeError = requestErrors.firstOrNull()?.message
                            loading = false
                            updateNavigationBadges()
                            renderHeader()
                            renderTab()
                        }
                    }
                    Tab.DISCOVER -> {
                        val response = repository.getDiscover()
                        mainHandler.post {
                            if (!isAttachedToWindow) return@post
                            discoverProfiles = response.optJSONArray("users") ?: JSONArray()
                            activeProfileIndex = focusedDiscoverProfileId
                                ?.let { targetId ->
                                    (0 until discoverProfiles.length()).firstOrNull { index ->
                                        discoverProfiles.optJSONObject(index)?.let(::profileId) == targetId
                                    }
                                } ?: 0
                            focusedDiscoverProfileId = null
                            loading = false
                            renderTab()
                        }
                    }
                    Tab.MATCHES -> {
                        val response = repository.getMatches()
                        mainHandler.post {
                            if (!isAttachedToWindow) return@post
                            matches = response.optJSONArray("matches") ?: JSONArray()
                            loading = false
                            renderTab()
                        }
                    }
                    Tab.CHATS -> {
                        val response = repository.getConversations()
                        mainHandler.post {
                            if (!isAttachedToWindow) return@post
                            conversations = response.optJSONArray("conversations") ?: JSONArray()
                            loading = false
                            updateNavigationBadges()
                            renderTab()
                        }
                    }
                    Tab.PROFILE -> {
                        val response = repository.getCurrentUser()
                        mainHandler.post {
                            if (!isAttachedToWindow) return@post
                            user = repository.parseCurrentUser(response)
                            loading = false
                            renderHeader()
                            renderTab()
                        }
                    }
                }
            } catch (error: Exception) {
                showError(error)
            }
        }
    }

    private fun renderTab() {
        val chatVisible = currentScreen == "chat"
        chatComposer.visibility = if (chatVisible) VISIBLE else GONE
        navigation.visibility = if (chatVisible) GONE else VISIBLE
        if (currentScreen != "tab" || selectedTab != Tab.HOME) {
            body.setPadding(dp(22), dp(4), dp(22), dp(24))
        }
        body.removeAllViews()
        when {
            currentScreen == "edit" -> renderEditProfile()
            currentScreen == "chat" -> renderChat()
            loading -> addState("Loading your ${selectedTab.label.lowercase()}…", loading = true)
            loadError != null -> addState(loadError!!, action = "Try again") { loadTab() }
            currentScreen == "notifications" -> renderNotifications()
            currentScreen == "membership" -> renderMembership()
            currentScreen == "settings" -> renderSettings()
            else -> when (selectedTab) {
                Tab.HOME -> renderHome()
                Tab.DISCOVER -> renderDiscover()
                Tab.MATCHES -> renderMatches()
                Tab.CHATS -> renderConversations()
                Tab.PROFILE -> renderProfile()
            }
        }
        if (body.parent == null) {
            scroll.removeAllViews()
            scroll.addView(body, LayoutParams(MATCH_PARENT, WRAP_CONTENT))
        }
    }

    private fun loadAuxiliaryScreen() {
        val requestedScreen = currentScreen
        loading = true
        loadError = null
        renderTab()
        io.execute {
            try {
                when (requestedScreen) {
                    "notifications" -> {
                        val response = repository.getNotifications()
                        mainHandler.post {
                            if (!isAttachedToWindow || currentScreen != requestedScreen) return@post
                            notifications = response.optJSONArray("notifications") ?: JSONArray()
                            loading = false
                            renderTab()
                        }
                    }
                    "membership" -> {
                        val status = repository.getSubscriptionStatus()
                        val planResponse = repository.getSubscriptionPlans()
                        mainHandler.post {
                            if (!isAttachedToWindow || currentScreen != requestedScreen) return@post
                            subscriptionStatus = status
                            subscriptionPlans = planResponse.optJSONArray("plans") ?: JSONArray()
                            loading = false
                            renderTab()
                        }
                    }
                    "settings" -> mainHandler.post {
                        if (!isAttachedToWindow || currentScreen != requestedScreen) return@post
                        loading = false
                        renderTab()
                    }
                }
            } catch (error: Exception) {
                showError(error)
            }
        }
    }

    private fun renderHome() {
        body.setPadding(dp(16), dp(2), dp(16), dp(28))
        renderWelcome()
        if (!user.profileCompleted) renderProfileCompletionCard()
        if (homeError != null) {
            addHomeError()
        }
        addHomeSectionHeader(body, "Discover People", "See All  ›") {
            navigation.selectedItemId = Tab.DISCOVER.id
        }
        renderHomeDiscoverRail()
        addHomeSectionHeader(body, "Quick Actions", null, null)
        renderQuickActions()
        addHomeSectionHeader(body, "Your Matches", "View All  ›") {
            navigation.selectedItemId = Tab.MATCHES.id
        }
        renderHomeMatches()
        addHomeSectionHeader(body, "Recent Conversations", "View All  ›") {
            navigation.selectedItemId = Tab.CHATS.id
        }
        renderRecentConversations()
        renderInspirationBanner()
    }

    private fun renderWelcome() {
        val welcome = LinearLayout(context).apply {
            orientation = HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, dp(6), 0, dp(14))
        }
        val greetingText = LinearLayout(context).apply { orientation = VERTICAL }
        val titleRow = LinearLayout(context).apply {
            orientation = HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        val title = addLabel(titleRow, greeting(), 23, HOME_PRIMARY, true).apply {
            typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
            maxLines = 2
            titleRow.addView(this)
        }
        val titleHeart = ImageView(context).apply {
            setImageResource(R.drawable.ic_home_brand_heart)
            imageTintList = ColorStateList.valueOf(ROSE)
            contentDescription = "Love"
        }
        titleRow.addView(titleHeart, LayoutParams(dp(16), dp(16)).apply { marginStart = dp(5) })
        greetingText.addView(titleRow)
        addLabel(greetingText, "Your next meaningful connection could start today.", 13, HOME_SECONDARY, false)
            .also { greetingText.addView(it) }
        welcome.addView(greetingText, LayoutParams(0, WRAP_CONTENT, 1f))
        val heart = ImageView(context).apply {
            setImageResource(R.drawable.ic_home_brand_heart)
            alpha = 0.28f
            contentDescription = null
        }
        welcome.addView(heart, LayoutParams(dp(44), dp(44)).apply { marginStart = dp(8) })
        body.addView(welcome, matchWidth())
    }

    private fun renderProfileCompletionCard() {
        val percent = profileCompletionPercent()
        if (percent >= 100) return
        val panel = LinearLayout(context).apply {
            orientation = HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(14), dp(14), dp(14), dp(14))
            background = rounded(ContextCompat.getColor(context, R.color.home_pink_tint), 18)
            elevation = dp(2).toFloat()
        }
        panel.addView(ProfileProgressRing(context, percent), LayoutParams(dp(62), dp(62)))
        val details = LinearLayout(context).apply {
            orientation = VERTICAL
            setPadding(dp(12), 0, 0, 0)
        }
        addLabel(details, "Complete Your Profile", 15, HOME_PRIMARY, true).also { details.addView(it) }
        addLabel(
            details,
            "Add details to get better matches and more meaningful connections.",
            12,
            HOME_SECONDARY,
            false
        ).apply {
            setPadding(0, dp(3), 0, dp(9))
            details.addView(this)
        }
        val button = MaterialButton(context).apply {
            text = "Complete Profile  →"
            textSize = 12f
            isAllCaps = false
            minHeight = dp(38)
            insetTop = 0
            insetBottom = 0
            cornerRadius = dp(13)
            background = GradientDrawable(
                GradientDrawable.Orientation.LEFT_RIGHT,
                intArrayOf(ContextCompat.getColor(context, R.color.brand_start), ROSE)
            ).apply { cornerRadius = dp(13).toFloat() }
            setTextColor(ContextCompat.getColor(context, R.color.white))
            setOnClickListener { openProfileEditor() }
        }
        details.addView(button, LayoutParams(WRAP_CONTENT, dp(38)))
        panel.addView(details, LayoutParams(0, WRAP_CONTENT, 1f))
        body.addView(panel, matchWidth())
        addSpace(body, 18)
    }

    private fun profileCompletionPercent(): Int {
        val filled = listOf(
            user.name.isNotBlank() && user.name != "there",
            user.bio.isNotBlank(),
            user.location.isNotBlank(),
            user.interests.isNotEmpty(),
            user.relationshipGoals.isNotBlank()
        ).count { it }
        return (filled * 100) / 5
    }

    private fun openProfileEditor() {
        selectedTab = Tab.PROFILE
        navigation.menu.findItem(Tab.PROFILE.id).isChecked = true
        currentScreen = "edit"
        renderHeader()
        renderEditProfile()
    }

    private fun renderHomeDiscoverRail() {
        if (discoverProfiles.length() == 0) {
            addHomeEmptyState(
                "No new profiles to show right now.",
                "Try again",
                if (loading) null else ({ loadTab() })
            )
            return
        }
        val rail = horizontalRail()
        for (index in 0 until minOf(discoverProfiles.length(), 12)) {
            val profile = discoverProfiles.optJSONObject(index) ?: continue
            rail.content.addView(
                createHomeDiscoverCard(profile),
                LayoutParams(dp(230), dp(310)).apply { marginEnd = dp(12) }
            )
        }
        body.addView(rail, matchWidth())
        addSpace(body, 4)
    }

    private fun createHomeDiscoverCard(profile: JSONObject): View {
        val name = profile.optString("name").ifBlank { "Elovia member" }
        val card = FrameLayout(context).apply {
            background = rounded(SURFACE, 16)
            clipToOutline = true
            elevation = dp(3).toFloat()
            isClickable = true
            isFocusable = true
            setOnClickListener { openProfileInDiscover(profile) }
        }
        val photo = ImageView(context).apply {
            scaleType = ImageView.ScaleType.CENTER_CROP
            contentDescription = "$name profile photo"
            setBackgroundColor(ContextCompat.getColor(context, R.color.home_pink_tint))
        }
        card.addView(photo, FrameLayout.LayoutParams(MATCH_PARENT, MATCH_PARENT))
        loadPhoto(photo, profile.optString("profilePhoto"))

        val gradient = View(context).apply {
            background = GradientDrawable(
                GradientDrawable.Orientation.TOP_BOTTOM,
                intArrayOf(0x00000000, 0xCC000000.toInt())
            )
        }
        card.addView(gradient, FrameLayout.LayoutParams(MATCH_PARENT, dp(150), Gravity.BOTTOM))

        if (isFreshlyOnline(profile)) {
            val online = LinearLayout(context).apply {
                orientation = HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                setPadding(dp(8), dp(5), dp(9), dp(5))
                background = rounded(0x99000000.toInt(), 18)
            }
            online.addView(View(context).apply {
                background = GradientDrawable().apply {
                    shape = GradientDrawable.OVAL
                    setColor(ContextCompat.getColor(context, R.color.home_online))
                }
            }, LayoutParams(dp(7), dp(7)).apply { marginEnd = dp(5) })
            addLabel(online, "Online", 10, ContextCompat.getColor(context, R.color.white), true)
                .also { online.addView(it) }
            val topRight = FrameLayout.LayoutParams(WRAP_CONTENT, WRAP_CONTENT, Gravity.TOP or Gravity.END)
            topRight.setMargins(0, dp(10), dp(10), 0)
            card.addView(online, topRight)
        }

        val bottom = LinearLayout(context).apply {
            orientation = HORIZONTAL
            gravity = Gravity.BOTTOM or Gravity.CENTER_VERTICAL
            setPadding(dp(12), dp(38), dp(10), dp(12))
        }
        val profileInfo = LinearLayout(context).apply {
            orientation = VERTICAL
            gravity = Gravity.BOTTOM
        }
        val titleRow = LinearLayout(context).apply {
            orientation = HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
        }
        addLabel(titleRow, name, 17, ContextCompat.getColor(context, R.color.white), true).apply {
            maxLines = 1
            ellipsize = android.text.TextUtils.TruncateAt.END
            titleRow.addView(this)
        }
        if (profile.optBoolean("isVerified")) {
            val verified = ImageView(context).apply {
                setImageResource(R.drawable.ic_home_verified)
                contentDescription = "Verified profile"
            }
            titleRow.addView(verified, LayoutParams(dp(18), dp(18)).apply { marginStart = dp(4) })
        }
        profileInfo.addView(titleRow)
        val age = profile.optInt("age").takeIf { profile.has("age") && !profile.isNull("age") }
        val location = profile.optString("location").takeIf(String::isNotBlank)
        val subline = listOfNotNull(age?.toString(), location?.substringBefore(',')?.trim())
            .joinToString("  ·  ")
        if (subline.isNotBlank()) {
            addLabel(profileInfo, subline, 12, ContextCompat.getColor(context, R.color.white), false)
                .also { profileInfo.addView(it) }
        }
        bottom.addView(profileInfo, LayoutParams(0, WRAP_CONTENT, 1f))

        val viewButton = homeRoundAction(R.drawable.ic_home_eye, "View $name") {
            openProfileInDiscover(profile)
        }
        bottom.addView(viewButton, LayoutParams(dp(40), dp(40)).apply { marginStart = dp(5) })
        val likeButton = homeRoundAction(
            R.drawable.ic_nav_matches,
            "Like $name",
            ROSE,
            ContextCompat.getColor(context, R.color.white)
        ) {
            likeHomeProfile(profile)
        }
        bottom.addView(likeButton, LayoutParams(dp(40), dp(40)).apply { marginStart = dp(7) })
        card.addView(bottom, FrameLayout.LayoutParams(MATCH_PARENT, WRAP_CONTENT, Gravity.BOTTOM))
        return card
    }

    private fun openProfileInDiscover(profile: JSONObject) {
        focusedDiscoverProfileId = profileId(profile)
        navigation.selectedItemId = Tab.DISCOVER.id
    }

    private fun likeHomeProfile(profile: JSONObject) {
        val id = profileId(profile)
        if (id.isBlank()) {
            showMessage("This profile doesn't have a valid ID.")
            return
        }
        io.execute {
            try {
                val result = repository.swipe(id, "like")
                val refreshedMatches = if (result.optBoolean("isMatch")) repository.getMatches() else null
                mainHandler.post {
                    if (!isAttachedToWindow) return@post
                    discoverProfiles = JSONArray().apply {
                        for (index in 0 until discoverProfiles.length()) {
                            val candidate = discoverProfiles.optJSONObject(index) ?: continue
                            if (profileId(candidate) != id) put(candidate)
                        }
                    }
                    if (refreshedMatches != null) {
                        matches = refreshedMatches.optJSONArray("matches") ?: matches
                    }
                    renderTab()
                    showMessage(if (result.optBoolean("isMatch")) "It's a match!" else "Like sent.")
                }
            } catch (error: Exception) {
                mainHandler.post {
                    if (error is ApiException && error.statusCode == 401) onSessionExpired()
                    else showMessage(error.message ?: "Couldn't send your like.")
                }
            }
        }
    }

    private fun renderQuickActions() {
        val rail = horizontalRail()
        val cards = listOf(
            QuickAction("Discover", "Find your people", R.drawable.ic_home_search,
                ContextCompat.getColor(context, R.color.home_pink_tint), null) {
                navigation.selectedItemId = Tab.DISCOVER.id
            },
            QuickAction("Matches", "View your matches", R.drawable.ic_nav_matches,
                ContextCompat.getColor(context, R.color.home_pink_tint), matches.length()) {
                navigation.selectedItemId = Tab.MATCHES.id
            },
            QuickAction("Messages", "Continue chatting", R.drawable.ic_home_chat,
                ContextCompat.getColor(context, R.color.home_purple_tint), totalUnreadMessages()) {
                navigation.selectedItemId = Tab.CHATS.id
            },
            QuickAction("Random Video", "Meet new people", R.drawable.ic_home_video,
                ContextCompat.getColor(context, R.color.home_peach_tint), null) {
                openPage("https://elovialove.onrender.com/random-video")
            }
        )
        cards.forEach { action ->
            val tile = LinearLayout(context).apply {
                orientation = VERTICAL
                setPadding(dp(12), dp(12), dp(10), dp(12))
                background = rounded(action.tint, 16)
                isClickable = true
                isFocusable = true
                setOnClickListener { action.onClick() }
            }
            val iconRow = FrameLayout(context)
            val icon = ImageView(context).apply {
                setImageResource(action.icon)
                contentDescription = null
            }
            iconRow.addView(icon, FrameLayout.LayoutParams(dp(24), dp(24)))
            if (action.badgeCount != null && action.badgeCount > 0) {
                addCountBadge(iconRow, action.badgeCount, Gravity.TOP or Gravity.END)
            }
            if (action.title == "Matches") {
                icon.imageTintList = ColorStateList.valueOf(ROSE)
            }
            tile.addView(iconRow, LayoutParams(MATCH_PARENT, dp(26)))
            addLabel(tile, action.title, 13, HOME_PRIMARY, true).apply {
                maxLines = 1
                setPadding(0, dp(9), 0, dp(2))
                tile.addView(this)
            }
            addLabel(tile, action.subtitle, 10, HOME_SECONDARY, false).apply {
                maxLines = 2
                tile.addView(this)
            }
            rail.content.addView(tile, LayoutParams(dp(132), dp(112)).apply { marginEnd = dp(10) })
        }
        body.addView(rail, matchWidth())
        addSpace(body, 2)
    }

    private fun renderHomeMatches() {
        if (matches.length() == 0) {
            addHomeEmptyState("Your mutual matches will appear here.", "Discover people") {
                navigation.selectedItemId = Tab.DISCOVER.id
            }
            return
        }
        val rail = horizontalRail()
        for (index in 0 until matches.length()) {
            val match = matches.optJSONObject(index) ?: continue
            val person = match.optJSONArray("users")?.optJSONObject(0) ?: match.optJSONObject("otherUser") ?: continue
            val item = LinearLayout(context).apply {
                orientation = VERTICAL
                gravity = Gravity.CENTER_HORIZONTAL
                isClickable = true
                isFocusable = true
                setOnClickListener { openConversation(person) }
            }
            val avatar = addAvatar(item, person.optString("profilePhoto"), person.optString("name"), 80).apply {
                setPadding(dp(2), dp(2), dp(2), dp(2))
                background = GradientDrawable().apply {
                    shape = GradientDrawable.OVAL
                    setColor(SURFACE)
                    setStroke(dp(1), ROSE)
                }
                contentDescription = "Open ${person.optString("name")}'s conversation"
            }
            if (isFreshlyOnline(person)) addOnlineDot(avatar)
            addLabel(item, person.optString("name").ifBlank { "Match" }, 11, HOME_PRIMARY, true).apply {
                gravity = Gravity.CENTER
                maxLines = 1
                ellipsize = android.text.TextUtils.TruncateAt.END
                item.addView(this, LayoutParams(dp(82), WRAP_CONTENT).apply { topMargin = dp(6) })
            }
            item.contentDescription = "Open match ${person.optString("name")}"
            rail.content.addView(item, LayoutParams(dp(88), WRAP_CONTENT).apply { marginEnd = dp(8) })
        }
        body.addView(rail, matchWidth())
    }

    private fun renderRecentConversations() {
        if (conversations.length() == 0) {
            addHomeEmptyState("No conversations yet. Your chats will show up here.", "See matches") {
                navigation.selectedItemId = Tab.MATCHES.id
            }
            return
        }
        for (index in 0 until minOf(4, conversations.length())) {
            val conversation = conversations.optJSONObject(index) ?: continue
            val person = conversation.optJSONObject("otherUser") ?: continue
            val row = LinearLayout(context).apply {
                orientation = HORIZONTAL
                gravity = Gravity.CENTER_VERTICAL
                setPadding(0, dp(9), 0, dp(9))
                isClickable = true
                isFocusable = true
                setOnClickListener { openConversation(conversation) }
            }
            addAvatar(row, person.optString("profilePhoto"), person.optString("name"), 50)
            val details = LinearLayout(context).apply {
                orientation = VERTICAL
                setPadding(dp(9), 0, dp(4), 0)
            }
            addLabel(details, person.optString("name").ifBlank { "Elovia member" }, 14, HOME_PRIMARY, true)
                .also { details.addView(it) }
            val lastMessage = conversation.optJSONObject("lastMessage")
            addLabel(
                details,
                lastMessage?.optString("content")?.takeIf(String::isNotBlank) ?: "You matched — say hello.",
                12,
                HOME_SECONDARY,
                false
            ).apply {
                maxLines = 1
                ellipsize = android.text.TextUtils.TruncateAt.END
                details.addView(this)
            }
            row.addView(details, LayoutParams(0, WRAP_CONTENT, 1f))
            val trailing = LinearLayout(context).apply {
                orientation = VERTICAL
                gravity = Gravity.END or Gravity.CENTER_VERTICAL
            }
            val timestamp = lastMessage?.optString("createdAt").orEmpty()
            val whenText = relativeTimestamp(timestamp)
            if (whenText.isNotBlank()) addLabel(trailing, whenText, 10, HOME_SECONDARY, false)
                .also { trailing.addView(it) }
            val unread = conversation.optInt("unreadCount")
            if (unread > 0) addLabel(trailing, unread.toString(), 10, ContextCompat.getColor(context, R.color.white), true).apply {
                gravity = Gravity.CENTER
                background = rounded(ROSE, 12)
                trailing.addView(this, LayoutParams(dp(20), dp(20)).apply { topMargin = dp(3) })
            }
            row.addView(trailing, LayoutParams(WRAP_CONTENT, WRAP_CONTENT))
            val chevron = ImageView(context).apply {
                setImageResource(R.drawable.ic_home_chevron)
                contentDescription = null
            }
            row.addView(chevron, LayoutParams(dp(20), dp(24)).apply { marginStart = dp(3) })
            body.addView(row, matchWidth())
            if (index < minOf(3, conversations.length() - 1)) {
                body.addView(View(context).apply { setBackgroundColor(HOME_DIVIDER) }, LayoutParams(MATCH_PARENT, dp(1)))
            }
        }
    }

    private fun renderInspirationBanner() {
        val banner = FrameLayout(context).apply {
            background = rounded(ROSE, 20)
            clipToOutline = true
            elevation = dp(2).toFloat()
            setPadding(dp(16), dp(16), dp(14), dp(16))
        }
        val photograph = ImageView(context).apply {
            setImageResource(R.drawable.home_sunset_couple)
            scaleType = ImageView.ScaleType.CENTER_CROP
            contentDescription = null
        }
        banner.addView(photograph, FrameLayout.LayoutParams(MATCH_PARENT, MATCH_PARENT))
        val tint = View(context).apply {
            background = GradientDrawable(
                GradientDrawable.Orientation.LEFT_RIGHT,
                intArrayOf(0xE8FD2B6B.toInt(), 0x6696375E)
            )
        }
        banner.addView(tint, FrameLayout.LayoutParams(MATCH_PARENT, MATCH_PARENT))
        val copy = LinearLayout(context).apply {
            orientation = HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, 0, dp(60), 0)
        }
        val heartBadge = FrameLayout(context).apply {
            background = rounded(0x44FFFFFF, 30)
        }
        val heart = ImageView(context).apply {
            setImageResource(R.drawable.ic_home_brand_heart)
            imageTintList = ColorStateList.valueOf(ContextCompat.getColor(context, R.color.white))
            contentDescription = null
        }
        heartBadge.addView(heart, FrameLayout.LayoutParams(dp(22), dp(22), Gravity.CENTER))
        copy.addView(heartBadge, LayoutParams(dp(38), dp(38)).apply { marginEnd = dp(10) })
        addLabel(
            copy,
            "A meaningful connection begins with one honest conversation.  ♥",
            14,
            ContextCompat.getColor(context, R.color.white),
            true
        ).apply {
            maxLines = 3
            copy.addView(this, LayoutParams(0, WRAP_CONTENT, 1f))
        }
        banner.addView(copy, FrameLayout.LayoutParams(MATCH_PARENT, MATCH_PARENT))
        val couple = ImageView(context).apply {
            setImageResource(R.drawable.ic_home_couple)
            alpha = 0.86f
            contentDescription = null
        }
        banner.addView(
            couple,
            FrameLayout.LayoutParams(dp(74), dp(76), Gravity.END or Gravity.CENTER_VERTICAL)
        )
        body.addView(banner, LayoutParams(MATCH_PARENT, dp(100)).apply {
            topMargin = dp(18)
            bottomMargin = dp(12)
        })
    }

    private fun addHomeError() {
        val error = LinearLayout(context).apply {
            orientation = HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(12), dp(10), dp(12), dp(10))
            background = rounded(ContextCompat.getColor(context, R.color.home_peach_tint), 12)
        }
        addLabel(error, "Some Home content couldn't be refreshed.", 12, HOME_PRIMARY, false)
            .also { error.addView(it, LayoutParams(0, WRAP_CONTENT, 1f)) }
        addLabel(error, "Retry", 12, ROSE, true).apply {
            setOnClickListener { loadTab() }
            error.addView(this)
        }
        body.addView(error, matchWidth())
        addSpace(body, 10)
    }

    private fun addHomeEmptyState(text: String, action: String, onAction: (() -> Unit)?) {
        val panel = LinearLayout(context).apply {
            orientation = HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(12), dp(12), dp(12), dp(12))
            background = rounded(SURFACE, 14)
        }
        addLabel(panel, text, 12, HOME_SECONDARY, false).apply {
            panel.addView(this, LayoutParams(0, WRAP_CONTENT, 1f))
        }
        if (onAction != null) {
            addLabel(panel, action, 12, ROSE, true).apply {
                setOnClickListener { onAction() }
                panel.addView(this)
            }
        }
        body.addView(panel, matchWidth())
    }

    private fun addHomeSectionHeader(
        parent: LinearLayout,
        title: String,
        action: String?,
        onClick: (() -> Unit)?
    ) {
        val row = LinearLayout(context).apply {
            orientation = HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(0, dp(16), 0, dp(9))
        }
        addLabel(row, title, 18, HOME_PRIMARY, true).apply {
            typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
            row.addView(this, LayoutParams(0, WRAP_CONTENT, 1f))
        }
        if (action != null && onClick != null) {
            addLabel(row, action, 12, ROSE, true).apply {
                gravity = Gravity.CENTER_VERTICAL
                setOnClickListener { onClick() }
                row.addView(this)
            }
        }
        parent.addView(row, matchWidth())
    }

    private fun horizontalRail() = HomeRail(context)

    private inner class HomeRail(context: Context) : android.widget.HorizontalScrollView(context) {
        val content = LinearLayout(context).apply {
            orientation = HORIZONTAL
            gravity = Gravity.TOP
        }

        init {
            isHorizontalScrollBarEnabled = false
            clipToPadding = false
            setPadding(0, dp(2), dp(2), dp(8))
            addView(content, ViewGroup.LayoutParams(WRAP_CONTENT, WRAP_CONTENT))
        }
    }

    private fun totalUnreadMessages(): Int =
        (0 until conversations.length()).sumOf { conversations.optJSONObject(it)?.optInt("unreadCount") ?: 0 }

    private fun updateNavigationBadges() {
        val chatBadge = navigation.getOrCreateBadge(Tab.CHATS.id)
        chatBadge.backgroundColor = ROSE
        chatBadge.badgeTextColor = ContextCompat.getColor(context, R.color.white)
        chatBadge.number = totalUnreadMessages()
        chatBadge.isVisible = totalUnreadMessages() > 0
    }

    private fun notificationButton(): View {
        val container = FrameLayout(context)
        val button = ImageButton(context).apply {
            contentDescription = "Notifications"
            setImageResource(R.drawable.ic_home_bell)
            imageTintList = ColorStateList.valueOf(HOME_PRIMARY)
            background = android.graphics.drawable.ColorDrawable(android.graphics.Color.TRANSPARENT)
            setPadding(dp(11), dp(11), dp(11), dp(11))
            setOnClickListener {
                currentScreen = "notifications"
                renderHeader()
                loadAuxiliaryScreen()
            }
        }
        container.addView(button, FrameLayout.LayoutParams(dp(46), dp(48), Gravity.CENTER))
        if (unreadNotificationCount > 0) {
            val dot = View(context).apply {
                background = GradientDrawable().apply {
                    shape = GradientDrawable.OVAL
                    setColor(ROSE)
                    setStroke(dp(2), IVORY)
                }
            }
            container.addView(
                dot,
                FrameLayout.LayoutParams(dp(10), dp(10), Gravity.TOP or Gravity.END).apply {
                    topMargin = dp(7)
                    marginEnd = dp(8)
                }
            )
        }
        return container
    }

    private fun addCountBadge(parent: FrameLayout, count: Int, badgeGravity: Int) {
        val badge = TextView(context).apply {
            text = if (count > 99) "99+" else count.toString()
            textSize = 9f
            gravity = Gravity.CENTER
            setTextColor(ContextCompat.getColor(context, R.color.white))
            setPadding(dp(4), 0, dp(4), 0)
            background = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(ROSE)
            }
        }
        parent.addView(badge, FrameLayout.LayoutParams(WRAP_CONTENT, dp(17), badgeGravity))
    }

    private fun relativeTimestamp(value: String): String {
        if (value.isBlank() || value == "null") return ""
        val time = try {
            Instant.parse(value).toEpochMilli()
        } catch (_: DateTimeParseException) {
            return ""
        }
        return android.text.format.DateUtils.getRelativeTimeSpanString(
            time,
            System.currentTimeMillis(),
            android.text.format.DateUtils.MINUTE_IN_MILLIS
        ).toString()
    }

    private fun isFreshlyOnline(person: JSONObject): Boolean {
        if (!person.has("isActive") || !person.optBoolean("isActive")) return false
        val timestamp = person.optString("lastActive").takeIf { it.isNotBlank() && it != "null" } ?: return false
        val time = try {
            Instant.parse(timestamp).toEpochMilli()
        } catch (_: DateTimeParseException) {
            return false
        }
        return System.currentTimeMillis() - time in 0..(5 * 60 * 1000)
    }

    private fun profileId(profile: JSONObject): String =
        profile.optString("id").ifBlank { profile.optString("_id") }

    private data class QuickAction(
        val title: String,
        val subtitle: String,
        val icon: Int,
        val tint: Int,
        val badgeCount: Int?,
        val onClick: () -> Unit
    )

    private fun homeRoundAction(
        icon: Int,
        description: String,
        backgroundColor: Int = ContextCompat.getColor(context, R.color.white),
        iconColor: Int = ROSE,
        onClick: () -> Unit
    ) = ImageButton(context).apply {
        contentDescription = description
        setImageResource(icon)
        imageTintList = ColorStateList.valueOf(iconColor)
        background = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(backgroundColor)
        }
        setPadding(dp(10), dp(10), dp(10), dp(10))
        isClickable = true
        isFocusable = true
        setOnClickListener { onClick() }
    }

    private inner class ProfileProgressRing(context: Context, private val progress: Int) : View(context) {
        private val stroke = dp(5).toFloat()
        private val trackPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = ContextCompat.getColor(context, R.color.home_divider)
            style = Paint.Style.STROKE
            strokeWidth = stroke
        }
        private val progressPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = ROSE
            style = Paint.Style.STROKE
            strokeWidth = stroke
            strokeCap = Paint.Cap.ROUND
        }
        private val labelPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = HOME_PRIMARY
            textSize = dp(12).toFloat()
            textAlign = Paint.Align.CENTER
            typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
        }
        override fun onDraw(canvas: Canvas) {
            super.onDraw(canvas)
            val inset = stroke / 2 + dp(2)
            val bounds = RectF(inset, inset, width - inset, height - inset)
            canvas.drawArc(bounds, 0f, 360f, false, trackPaint)
            canvas.drawArc(bounds, -90f, 360f * progress / 100f, false, progressPaint)
            canvas.drawText("$progress%", width / 2f, height / 2f - (labelPaint.ascent() + labelPaint.descent()) / 2f, labelPaint)
        }
    }

    private fun renderDiscover() {
        addHeading(body, "Discover", 27)
        addText(body, "Meet people looking for something meaningful.", 15, MUTED)
        addSpace(body, 18)
        val profile = discoverProfiles.optJSONObject(activeProfileIndex)
        if (profile == null) {
            addState(
                if (discoverProfiles.length() == 0) "No profiles are available right now. Check back soon."
                else "You've seen all available profiles for now.",
                action = "Refresh"
            ) { loadTab() }
            return
        }
        addProfileCard(body, profile, compact = false)
        addSpace(body, 12)
        val actions = LinearLayout(context).apply {
            orientation = HORIZONTAL
            gravity = Gravity.CENTER
        }
        actions.addView(actionButton("Pass", PLUM) { performSwipe(profile, "pass") }, LayoutParams(0, dp(54), 1f))
        actions.addView(View(context), LayoutParams(dp(12), 1))
        actions.addView(actionButton("Like  ♥", ROSE) { performSwipe(profile, "like") }, LayoutParams(0, dp(54), 1f))
        body.addView(actions, matchWidth())
    }

    private fun renderMatches() {
        addHeading(body, "Your matches", 27)
        addText(body, "Connections that are mutual.", 15, MUTED)
        addSpace(body, 18)
        if (matches.length() == 0) {
            addState("Your mutual matches will show up here. Explore profiles and send a like to get started.", "Discover people") {
                navigation.selectedItemId = Tab.DISCOVER.id
            }
            return
        }
        for (index in 0 until matches.length()) {
            val match = matches.optJSONObject(index) ?: continue
            val people = match.optJSONArray("users") ?: continue
            val person = people.optJSONObject(0) ?: continue
            addConversationRow(body, person) { openConversation(person) }
        }
    }

    private fun renderConversations() {
        addHeading(body, "Messages", 27)
        addText(body, "A little conversation can go a long way.", 15, MUTED)
        addSpace(body, 18)
        if (conversations.length() == 0) {
            addState("Your conversations with matches will appear here.", "See matches") {
                navigation.selectedItemId = Tab.MATCHES.id
            }
            return
        }
        for (index in 0 until conversations.length()) {
            val conversation = conversations.optJSONObject(index) ?: continue
            addConversationRow(body, conversation) { openConversation(conversation) }
        }
    }

    private fun renderProfile() {
        addHeading(body, "Your profile", 27)
        addSpace(body, 14)
        addCard(body) {
            addAvatar(this, user.profilePhoto, user.name, 92)
            addSpace(this, 12)
            addText(this, user.name + (user.age?.let { ", $it" } ?: ""), 23, CHARCOAL, true)
            if (user.isVerified) addText(this, "Verified profile", 13, PLUM, true)
            if (user.location.isNotBlank()) addText(this, user.location, 14, MUTED)
            if (user.bio.isNotBlank()) {
                addSpace(this, 12)
                addText(this, user.bio, 15, CHARCOAL)
            }
            if (user.interests.isNotEmpty()) {
                addSpace(this, 14)
                addText(this, user.interests.joinToString("  ·  "), 14, PLUM)
            }
            if (user.relationshipGoals.isNotBlank()) {
                addSpace(this, 8)
                addText(this, user.relationshipGoals, 14, MUTED)
            }
        }
        addButton(body, "Change profile photo", false) {
            if (!isUploadingPhoto) onRequestPhoto()
        }
        addSpace(body, 14)
        addButton(body, "Edit profile", true) {
            currentScreen = "edit"
            renderHeader()
            renderEditProfile()
        }
        addSpace(body, 10)
        addButton(body, "Notifications", false) {
            currentScreen = "notifications"
            renderHeader()
            loadAuxiliaryScreen()
        }
        addButton(body, "Membership plans", false) {
            currentScreen = "membership"
            renderHeader()
            loadAuxiliaryScreen()
        }
        addButton(body, "Settings", false) {
            currentScreen = "settings"
            renderHeader()
            renderTab()
        }
        addSpace(body, 10)
        addButton(body, "Terms of Service", false) { openPage("https://elovialove.onrender.com/terms") }
        addButton(body, "Privacy Policy", false) { openPage("https://elovialove.onrender.com/privacy") }
        addSpace(body, 18)
        addButton(body, "Log out", false, PLUM) {
            MaterialAlertDialogBuilder(context)
                .setTitle("Log out?")
                .setMessage("You'll need to sign in again to access your account.")
                .setNegativeButton("Cancel", null)
                .setPositiveButton("Log out") { _, _ -> performLogout() }
                .show()
        }
    }

    private fun renderNotifications() {
        addHeading(body, "Notifications", 27)
        addText(body, "Updates about your Elovia connections.", 15, MUTED)
        addSpace(body, 18)
        if (notifications.length() == 0) {
            addState("You're all caught up. New activity will appear here.")
            return
        }
        for (index in 0 until notifications.length()) {
            val item = notifications.optJSONObject(index) ?: continue
            addCard(body) {
                addText(this, item.optString("title").ifBlank { "Elovia update" }, 16, CHARCOAL, true)
                addSpace(this, 4)
                addText(this, item.optString("message"), 14, MUTED)
                if (!item.optBoolean("isRead")) {
                    addSpace(this, 8)
                    addText(this, "NEW", 12, PLUM, true)
                }
            }
            addSpace(body, 10)
        }
    }

    private fun renderMembership() {
        addHeading(body, "Membership", 27)
        addText(body, "Your current plan and available options.", 15, MUTED)
        addSpace(body, 18)
        addCard(body) {
            addText(this, "Current plan", 14, MUTED)
            addText(this, subscriptionStatus.optString("plan").ifBlank { "Free" }.replaceFirstChar { it.uppercase() }, 21, CHARCOAL, true)
            val expires = subscriptionStatus.optString("subscriptionEnd")
            if (expires.isNotBlank() && expires != "null") addText(this, "Renews or ends: ${expires.substringBefore('T')}", 14, MUTED)
        }
        addSpace(body, 18)
        addText(body, "Available plans", 19, CHARCOAL, true)
        addSpace(body, 8)
        if (subscriptionPlans.length() == 0) {
            addState("No plans are currently available.")
            return
        }
        for (index in 0 until subscriptionPlans.length()) {
            val plan = subscriptionPlans.optJSONObject(index) ?: continue
            addCard(body) {
                addText(this, plan.optString("name").ifBlank { plan.optString("key") }, 18, CHARCOAL, true)
                val price = plan.opt("effectivePrice")?.toString().orEmpty()
                val currency = plan.optString("currency").ifBlank { "INR" }
                if (price.isNotBlank()) addText(this, "$currency $price", 16, PLUM, true)
                val description = plan.optString("description")
                if (description.isNotBlank()) addText(this, description, 14, MUTED)
            }
            addSpace(body, 10)
        }
        addText(body, "Plan purchases are managed through the website.", 13, MUTED)
        addButton(body, "View plans on website", false) { openPage("https://elovialove.onrender.com/pricing") }
    }

    private fun renderSettings() {
        addHeading(body, "Settings", 27)
        addText(body, "Manage your account and preferences.", 15, MUTED)
        addSpace(body, 18)
        addCard(body) {
            addText(this, "Signed in as", 13, MUTED)
            addText(this, user.email, 16, CHARCOAL, true)
        }
        addSpace(body, 12)
        addButton(body, "Notification center", false) {
            currentScreen = "notifications"
            renderHeader()
            loadAuxiliaryScreen()
        }
        addButton(body, "Privacy policy", false) { openPage("https://elovialove.onrender.com/privacy") }
        addText(body, "Appearance follows your Android system light or dark theme.", 13, MUTED)
    }

    private fun renderEditProfile() {
        body.removeAllViews()
        addHeading(body, "Edit profile", 27)
        addText(body, "Update the profile details shown to other members.", 14, MUTED)
        addButton(body, "Change profile photo", false) {
            if (!isUploadingPhoto) onRequestPhoto()
        }
        addSpace(body, 18)
        val name = textField("Name", user.name)
        val bio = textField("About you", user.bio, multiline = true)
        val location = textField("Location", user.location)
        val interests = textField("Interests (comma-separated)", user.interests.joinToString(", "))
        val goals = TextInputLayout(context).apply {
            hint = "Relationship goals"
            boxBackgroundMode = TextInputLayout.BOX_BACKGROUND_OUTLINE
            setDefaultHintTextColor(ColorStateList.valueOf(MUTED))
            boxBackgroundColor = SURFACE
        }
        val goalInput = android.widget.AutoCompleteTextView(context).apply {
            setText(user.relationshipGoals)
            setAdapter(android.widget.ArrayAdapter(
                context,
                android.R.layout.simple_dropdown_item_1line,
                listOf("Casual Dating", "Serious Relationship", "Marriage", "Friendship")
            ))
            threshold = 0
            setOnClickListener { showDropDown() }
            isFocusable = false
        }
        goals.addView(goalInput)
        body.addView(goals, matchWidth())
        addSpace(body, 18)
        lateinit var save: MaterialButton
        save = addButton(body, "Save profile", true) {
            val value = name.text?.toString()?.trim().orEmpty()
            if (value.length !in 2..50) {
                name.error = "Name must be 2–50 characters"
                return@addButton
            }
            save.isEnabled = false
            save.text = "Saving…"
            io.execute {
                try {
                    repository.updateProfile(
                        value,
                        bio.text?.toString().orEmpty(),
                        location.text?.toString().orEmpty(),
                        interests.text?.toString().orEmpty().split(',').map(String::trim).filter(String::isNotBlank),
                        goalInput.text?.toString().orEmpty()
                    )
                    val refreshed = repository.getCurrentUser()
                    user = repository.parseCurrentUser(refreshed)
                    mainHandler.post {
                        if (!isAttachedToWindow) return@post
                        currentScreen = "tab"
                        renderHeader()
                        renderTab()
                        showMessage("Profile updated.")
                    }
                } catch (error: Exception) {
                    mainHandler.post {
                        save.isEnabled = true
                        save.text = "Save profile"
                        showError(error)
                    }
                }
            }
        }
        addSpace(body, 10)
        addButton(body, "Cancel", false) {
            currentScreen = "tab"
            renderHeader()
            renderTab()
        }
    }

    private fun renderChat() {
        val person = chatUser ?: return
        body.removeAllViews()
        chatComposer.visibility = VISIBLE
        navigation.visibility = GONE
        addText(body, "Messages are shared only with your match.", 13, MUTED)
        addSpace(body, 10)
        if (loading) {
            addState("Loading conversation…", loading = true)
            return
        }
        if (loadError != null) {
            addState(loadError!!, "Try again") { loadChat() }
            return
        }
        if (messages.length() == 0) {
            addState("Say hello to ${person.optString("name")} and start the conversation.")
        } else {
            for (index in 0 until messages.length()) {
                val message = messages.optJSONObject(index) ?: continue
                val senderValue = message.opt("sender")
                val senderId = if (senderValue is JSONObject) senderValue.optString("_id") else senderValue?.toString().orEmpty()
                val mine = senderId == user.id
                val bubble = TextView(context).apply {
                    text = message.optString("content")
                    textSize = 15f
                    setTextColor(if (mine) ON_ACCENT else CHARCOAL)
                    setPadding(dp(15), dp(11), dp(15), dp(11))
                    background = rounded(if (mine) ROSE else SURFACE, 18)
                }
                val row = LinearLayout(context).apply {
                    gravity = if (mine) Gravity.END else Gravity.START
                    setPadding(dp(5), dp(4), dp(5), dp(4))
                    addView(bubble, LayoutParams(WRAP_CONTENT, WRAP_CONTENT))
                }
                body.addView(row, matchWidth())
            }
        }
        renderChatComposer(person)
    }

    private fun renderChatComposer(person: JSONObject) {
        chatComposer.removeAllViews()
        val field = EditText(context).apply {
            hint = "Write a message"
            textSize = 15f
            maxLines = 4
            imeOptions = EditorInfo.IME_ACTION_SEND
            setTextColor(CHARCOAL)
            setHintTextColor(MUTED)
            setBackground(rounded(IVORY, 18))
            setPadding(dp(14), dp(10), dp(14), dp(10))
            minHeight = dp(48)
            contentDescription = "Message"
        }
        chatComposer.addView(field, LayoutParams(0, WRAP_CONTENT, 1f))
        val sendButton = iconButton(
            R.drawable.ic_send,
            "Send message",
            ROSE,
            ContextCompat.getColor(context, R.color.white)
        ) { }
        chatComposer.addView(sendButton, LayoutParams(dp(48), dp(48)).apply {
            marginStart = dp(8)
        })
        val send = {
            val content = field.text?.toString()?.trim().orEmpty()
            if (content.isNotEmpty() && !isSendingMessage) sendMessage(person, content)
        }
        sendButton.setOnClickListener { send() }
        fun updateSendButton() {
            val canSend = !isSendingMessage && !field.text.isNullOrBlank()
            sendButton.isEnabled = canSend
            sendButton.alpha = if (canSend) 1f else 0.55f
        }
        updateSendButton()
        field.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) = Unit
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) = updateSendButton()
            override fun afterTextChanged(s: Editable?) = Unit
        })
        field.setOnEditorActionListener { _, actionId, event ->
            val sendRequested = actionId == EditorInfo.IME_ACTION_SEND ||
                actionId == EditorInfo.IME_ACTION_DONE ||
                (event?.keyCode == KeyEvent.KEYCODE_ENTER && event?.action == KeyEvent.ACTION_DOWN)
            if (sendRequested) send()
            sendRequested
        }
    }

    private fun loadChat() {
        val person = chatUser ?: return
        loading = true
        loadError = null
        renderChat()
        io.execute {
            try {
                val response = repository.getMessages(person.optString("id").ifBlank { person.optString("_id") })
                mainHandler.post {
                    if (!isAttachedToWindow) return@post
                    messages = response.optJSONArray("messages") ?: JSONArray()
                    loading = false
                    loadError = null
                    renderChat()
                }
            } catch (error: Exception) {
                mainHandler.post {
                    loading = false
                    loadError = error.message ?: "Couldn't load this conversation."
                    renderChat()
                }
            }
        }
    }

    private fun sendMessage(person: JSONObject, content: String) {
        if (isSendingMessage || content.isBlank()) return
        isSendingMessage = true
        val id = person.optString("id").ifBlank { person.optString("_id") }
        io.execute {
            try {
                repository.sendMessage(id, content)
                val response = repository.getMessages(id)
                mainHandler.post {
                    if (!isAttachedToWindow) return@post
                    isSendingMessage = false
                    messages = response.optJSONArray("messages") ?: JSONArray()
                    renderChat()
                }
            } catch (error: Exception) {
                mainHandler.post {
                    isSendingMessage = false
                    showError(error)
                }
            }
        }
    }

    private fun performSwipe(profile: JSONObject, action: String) {
        val id = profile.optString("_id").ifBlank { profile.optString("id") }
        loading = true
        renderTab()
        io.execute {
            try {
                val result = repository.swipe(id, action)
                mainHandler.post {
                    if (!isAttachedToWindow) return@post
                    activeProfileIndex++
                    loading = false
                    renderTab()
                    if (result.optBoolean("isMatch")) {
                        showMessage("It's a match! Open Matches to say hello.")
                    }
                }
            } catch (error: Exception) {
                mainHandler.post {
                    loading = false
                    loadError = error.message ?: "Couldn't save your choice."
                    renderTab()
                }
            }
        }
    }

    private fun addProfileCard(parent: LinearLayout, profile: JSONObject, compact: Boolean) {
        val card = card()
        val photo = profile.optString("profilePhoto")
        val name = profile.optString("name").ifBlank { "Elovia member" }
        if (photo.isNotBlank() && !photo.startsWith("data:")) {
            val image = ImageView(context).apply {
                scaleType = ImageView.ScaleType.CENTER_CROP
                contentDescription = "$name profile photo"
                setBackgroundColor(PALE_ROSE)
            }
            card.addView(image, LayoutParams(MATCH_PARENT, dp(if (compact) 185 else 286)))
            loadPhoto(image, photo)
        } else {
            val placeholder = addLabel(card, name.take(1).uppercase(), 52, ROSE, true).apply {
                gravity = Gravity.CENTER
                background = rounded(PALE_ROSE, 18)
            }
            card.addView(placeholder, LayoutParams(MATCH_PARENT, dp(if (compact) 140 else 240)))
        }
        val details = LinearLayout(context).apply {
            orientation = VERTICAL
            setPadding(dp(18), dp(16), dp(18), dp(18))
        }
        val age = profile.optInt("age").takeIf { profile.has("age") && !profile.isNull("age") }
        addText(details, name + (age?.let { ", $it" } ?: ""), 21, CHARCOAL, true)
        if (profile.optBoolean("isVerified")) addText(details, "Verified profile", 12, PLUM, true)
        val location = profile.optString("location")
        if (location.isNotBlank()) addText(details, location, 13, MUTED)
        val bio = profile.optString("bio")
        if (bio.isNotBlank()) addText(details, bio, 14, CHARCOAL)
        val interests = profile.optJSONArray("interests")
        if (interests != null && interests.length() > 0) {
            val labels = (0 until minOf(5, interests.length())).mapNotNull { interests.optString(it).takeIf(String::isNotBlank) }
            if (labels.isNotEmpty()) addText(details, labels.joinToString("  ·  "), 13, PLUM)
        }
        card.addView(details, LayoutParams(MATCH_PARENT, WRAP_CONTENT))
        parent.addView(card, matchWidth())
    }

    private fun addConversationRow(parent: LinearLayout, item: JSONObject, onClick: () -> Unit) {
        val person = item.optJSONObject("otherUser") ?: item
        val row = card().apply {
            orientation = HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(14), dp(10), dp(14), dp(10))
            setOnClickListener { onClick() }
            isClickable = true
        }
        addAvatar(row, person.optString("profilePhoto"), person.optString("name"), 54)
        val details = LinearLayout(context).apply {
            orientation = VERTICAL
            setPadding(dp(12), dp(2), dp(6), dp(2))
        }
        addText(details, person.optString("name").ifBlank { "Elovia member" }, 16, CHARCOAL, true)
        val lastMessage = item.optJSONObject("lastMessage")?.optString("content").orEmpty()
        addText(details, lastMessage.ifBlank { "You matched — say hello." }, 13, MUTED)
        row.addView(details, LayoutParams(0, WRAP_CONTENT, 1f))
        val unread = item.optInt("unreadCount")
        if (unread > 0) {
            addLabel(row, unread.toString(), 12, ON_ACCENT, true).apply {
                gravity = Gravity.CENTER
                background = rounded(ROSE, 18)
                row.addView(this, LayoutParams(dp(26), dp(26)))
            }
        }
        parent.addView(row, matchWidth())
        addSpace(parent, 10)
    }

    private fun openConversation(item: JSONObject) {
        val person = item.optJSONObject("otherUser") ?: item
        val id = person.optString("id").ifBlank { person.optString("_id") }
        if (id.isBlank()) {
            showMessage("This match doesn't have a valid profile ID.")
            return
        }
        chatUser = JSONObject(person.toString()).put("id", id)
        currentScreen = "chat"
        renderHeader()
        loadChat()
    }

    private fun addState(text: String, action: String? = null, loading: Boolean = false, onAction: (() -> Unit)? = null) {
        val panel = card()
        panel.gravity = Gravity.CENTER
        panel.setPadding(dp(18), dp(34), dp(18), dp(34))
        addLabel(panel, if (loading) "…" else "♥", if (loading) 28 else 24, ROSE, true).apply {
            gravity = Gravity.CENTER
            panel.addView(this, LayoutParams(MATCH_PARENT, WRAP_CONTENT))
        }
        addLabel(panel, text, 15, MUTED, false).apply {
            gravity = Gravity.CENTER
            panel.addView(this, LayoutParams(MATCH_PARENT, WRAP_CONTENT))
        }
        if (action != null && onAction != null) {
            panel.addView(actionButton(action, ROSE, onAction), LayoutParams(MATCH_PARENT, dp(50)))
        }
        body.addView(panel, matchWidth())
    }

    private fun addSectionHeader(parent: LinearLayout, title: String, action: String, onClick: () -> Unit) {
        val row = LinearLayout(context).apply { orientation = HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
        addLabel(row, title, 19, CHARCOAL, true).also { row.addView(it, LayoutParams(0, WRAP_CONTENT, 1f)) }
        addLabel(row, action, 13, ROSE, true).apply {
            setOnClickListener { onClick() }
            row.addView(this)
        }
        parent.addView(row, matchWidth())
        addSpace(parent, 8)
    }

    private fun addCard(parent: LinearLayout, content: LinearLayout.() -> Unit) {
        val surface = card().apply {
            orientation = VERTICAL
            setPadding(dp(18), dp(18), dp(18), dp(18))
            content()
        }
        parent.addView(surface, matchWidth())
    }

    private fun card() = LinearLayout(context).apply {
        orientation = VERTICAL
        setPadding(dp(1), dp(1), dp(1), dp(1))
        background = rounded(SURFACE, 22)
        elevation = dp(2).toFloat()
    }

    private fun addButton(parent: LinearLayout, label: String, primary: Boolean, color: Int = ROSE, onClick: () -> Unit): MaterialButton {
        val button = MaterialButton(
            context,
            null,
            if (primary) com.google.android.material.R.attr.materialButtonStyle
            else com.google.android.material.R.attr.materialButtonOutlinedStyle
        ).apply {
            text = label
            isAllCaps = false
            textSize = 15f
            cornerRadius = dp(17)
            minHeight = dp(52)
            insetTop = 0
            insetBottom = 0
            if (primary) {
                background = GradientDrawable(
                    GradientDrawable.Orientation.LEFT_RIGHT,
                    intArrayOf(
                        ContextCompat.getColor(context, R.color.brand_start),
                        color
                    )
                ).apply { cornerRadius = dp(17).toFloat() }
                setTextColor(ON_ACCENT)
            } else {
                strokeColor = ColorStateList.valueOf(ContextCompat.getColor(context, R.color.app_outline))
                setTextColor(color)
            }
            setOnClickListener { onClick() }
        }
        parent.addView(button, matchWidth())
        return button
    }

    private fun actionButton(label: String, color: Int, onClick: () -> Unit) =
        MaterialButton(context).apply {
            text = label
            isAllCaps = false
            textSize = 15f
            cornerRadius = dp(17)
            insetTop = 0
            insetBottom = 0
            minHeight = dp(50)
            background = GradientDrawable(
                GradientDrawable.Orientation.LEFT_RIGHT,
                intArrayOf(ContextCompat.getColor(context, R.color.brand_start), color)
            ).apply { cornerRadius = dp(17).toFloat() }
            setTextColor(ON_ACCENT)
            setOnClickListener { onClick() }
        }

    private fun smallButton(label: String, onClick: () -> Unit) =
        MaterialButton(context, null, com.google.android.material.R.attr.materialButtonOutlinedStyle).apply {
            text = label
            isAllCaps = false
            textSize = 14f
            minWidth = dp(44)
            minHeight = dp(42)
            cornerRadius = dp(15)
            strokeColor = ColorStateList.valueOf(ContextCompat.getColor(context, R.color.app_outline))
            setTextColor(CHARCOAL)
            setOnClickListener { onClick() }
        }

    private fun iconButton(
        icon: Int,
        description: String,
        backgroundColor: Int = PALE_ROSE,
        iconColor: Int = PLUM,
        onClick: () -> Unit
    ) = ImageButton(context).apply {
        contentDescription = description
        setImageResource(icon)
        imageTintList = ColorStateList.valueOf(iconColor)
        scaleType = ImageView.ScaleType.CENTER
        setPadding(dp(12), dp(12), dp(12), dp(12))
        background = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(backgroundColor)
        }
        isClickable = true
        isFocusable = true
        setOnClickListener { onClick() }
    }

    private fun addAvatar(parent: LinearLayout, imageUrl: String, name: String, size: Int): FrameLayout {
        val avatar = ImageView(context).apply {
            scaleType = ImageView.ScaleType.CENTER_CROP
            contentDescription = "$name profile picture"
            background = ContextCompat.getDrawable(context, R.drawable.ic_profile_placeholder)
            clipToOutline = true
        }
        val frame = FrameLayout(context).apply {
            clipToOutline = true
            background = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(PALE_ROSE)
            }
            addView(avatar, FrameLayout.LayoutParams(MATCH_PARENT, MATCH_PARENT))
        }
        val progress = ProgressBar(context).apply {
            indeterminateTintList = ColorStateList.valueOf(ROSE)
            visibility = GONE
        }
        frame.addView(
            progress,
            FrameLayout.LayoutParams(dp(22), dp(22), Gravity.CENTER)
        )
        parent.addView(frame, LayoutParams(dp(size), dp(size)).apply {
            marginEnd = dp(10)
        })
        val model = photoModel(imageUrl)
        if (model == null) {
            avatar.setImageResource(R.drawable.ic_profile_placeholder)
            return frame
        }

        progress.visibility = VISIBLE
        Glide.with(avatar)
            .load(model)
            .transform(CircleCrop())
            .placeholder(R.drawable.ic_profile_placeholder)
            .error(R.drawable.ic_profile_placeholder)
            .listener(object : RequestListener<Drawable> {
                override fun onLoadFailed(
                    error: GlideException?,
                    model: Any?,
                    target: Target<Drawable>,
                    isFirstResource: Boolean
                ): Boolean {
                    progress.visibility = GONE
                    return false
                }

                override fun onResourceReady(
                    resource: Drawable,
                    model: Any,
                    target: Target<Drawable>?,
                    dataSource: DataSource,
                    isFirstResource: Boolean
                ): Boolean {
                    progress.visibility = GONE
                    return false
                }
            })
            .into(avatar)
        return frame
    }

    private fun addOnlineDot(parent: FrameLayout) {
        val dot = View(context).apply {
            background = GradientDrawable().apply {
                shape = GradientDrawable.OVAL
                setColor(ContextCompat.getColor(context, R.color.home_online))
                setStroke(dp(2), IVORY)
            }
            contentDescription = "Online"
        }
        parent.addView(dot, FrameLayout.LayoutParams(dp(15), dp(15), Gravity.BOTTOM or Gravity.END))
    }

    private fun photoModel(imageUrl: String): Any? {
        val source = imageUrl.trim()
        if (source.isBlank()) return null
        if (source.startsWith("data:image/", ignoreCase = true)) {
            val separator = source.indexOf(',')
            if (separator < 0 || !source.substring(0, separator).contains(";base64", ignoreCase = true)) {
                return null
            }
            return try {
                Base64.decode(source.substring(separator + 1), Base64.DEFAULT)
            } catch (_: IllegalArgumentException) {
                null
            }
        }
        return try {
            val backend = URI(
                BuildConfig.API_BASE_URL.trim().trimEnd('/').removeSuffix("/api")
            )
            val resolved = when {
                source.startsWith("https://", ignoreCase = true) ||
                    source.startsWith("http://", ignoreCase = true) -> URI(source)
                source.startsWith("//") -> URI("${backend.scheme}:$source")
                else -> URI("${backend}/").resolve(source)
            }
            resolved.takeIf {
                (it.scheme == "https" || it.scheme == "http") && !it.host.isNullOrBlank()
            }?.toString()
        } catch (_: URISyntaxException) {
            null
        } catch (_: IllegalArgumentException) {
            null
        }
    }

    private fun loadPhoto(image: ImageView, imageUrl: String) {
        val model = photoModel(imageUrl)
        if (model == null) {
            image.setImageResource(R.drawable.ic_profile_placeholder)
            return
        }
        Glide.with(image)
            .load(model)
            .placeholder(R.drawable.ic_profile_placeholder)
            .error(R.drawable.ic_profile_placeholder)
            .into(image)
    }

    private fun lastActiveLabel(person: JSONObject): String {
        val value = person.optString("lastActive").takeIf { it.isNotBlank() && it != "null" } ?: return ""
        val timestamp = try {
            Instant.parse(value).toEpochMilli()
        } catch (_: DateTimeParseException) {
            return ""
        }
        val relative = DateUtils.getRelativeTimeSpanString(
            timestamp,
            System.currentTimeMillis(),
            DateUtils.MINUTE_IN_MILLIS
        )
        return "Last active $relative"
    }

    fun uploadProfilePhoto(uri: Uri) {
        if (isUploadingPhoto) return
        isUploadingPhoto = true
        showMessage("Uploading profile photo…")
        io.execute {
            try {
                val mimeType = context.contentResolver.getType(uri)
                    ?.takeIf { it.startsWith("image/") }
                    ?: throw ApiException("Choose a valid image to upload.")
                val bytes = context.contentResolver.openInputStream(uri)?.use { input ->
                    val output = ByteArrayOutputStream()
                    val buffer = ByteArray(8_192)
                    var total = 0
                    while (true) {
                        val count = input.read(buffer)
                        if (count < 0) break
                        total += count
                        if (total > MAX_PROFILE_PHOTO_BYTES) {
                            throw ApiException("Profile photos must be 10 MB or smaller.")
                        }
                        output.write(buffer, 0, count)
                    }
                    output.toByteArray()
                } ?: throw IOException("Couldn't read the selected photo.")
                if (bytes.isEmpty()) throw ApiException("The selected photo is empty.")

                repository.uploadProfilePhoto(
                    "profile-photo.${mimeType.substringAfter('/').substringBefore('+')}",
                    mimeType,
                    bytes
                )
                val refreshed = repository.parseCurrentUser(repository.getCurrentUser())
                mainHandler.post {
                    if (!isAttachedToWindow) return@post
                    isUploadingPhoto = false
                    user = refreshed
                    selectedTab = Tab.PROFILE
                    currentScreen = "tab"
                    loading = false
                    loadError = null
                    renderHeader()
                    renderTab()
                    showMessage("Profile photo updated.")
                }
            } catch (error: Exception) {
                mainHandler.post {
                    isUploadingPhoto = false
                    if (error is ApiException && error.statusCode == 401) {
                        onSessionExpired()
                    } else {
                        showMessage(error.message ?: "Couldn't upload your profile photo.")
                    }
                }
            }
        }
    }

    private fun textField(label: String, value: String, multiline: Boolean = false): EditText {
        val container = TextInputLayout(context).apply {
            hint = label
            boxBackgroundMode = TextInputLayout.BOX_BACKGROUND_OUTLINE
            boxBackgroundColor = SURFACE
            setDefaultHintTextColor(ColorStateList.valueOf(MUTED))
        }
        val field = EditText(context).apply {
            setText(value)
            textSize = 15f
            setTextColor(CHARCOAL)
            if (multiline) {
                minLines = 3
                maxLines = 5
                gravity = Gravity.TOP
                inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_FLAG_MULTI_LINE or android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES
            } else {
                maxLines = 1
                inputType = android.text.InputType.TYPE_CLASS_TEXT or android.text.InputType.TYPE_TEXT_FLAG_CAP_SENTENCES
            }
        }
        container.addView(field)
        body.addView(container, matchWidth())
        addSpace(body, 14)
        return field
    }

    private fun addHeading(parent: LinearLayout, text: String, size: Int) {
        val label = addLabel(parent, text, size, CHARCOAL, true)
        label.setPadding(0, dp(12), 0, dp(4))
        parent.addView(label, matchWidth())
    }

    private fun addText(parent: LinearLayout, text: String, size: Int, color: Int, bold: Boolean = false) {
        parent.addView(addLabel(parent, text, size, color, bold), matchWidth())
    }

    private fun addLabel(parent: ViewGroup, text: String, size: Int, color: Int, bold: Boolean): TextView =
        TextView(context).apply {
            this.text = text
            textSize = size.toFloat()
            setTextColor(color)
            if (bold) typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
        }

    private fun addSpace(parent: LinearLayout, height: Int) {
        parent.addView(View(context), LayoutParams(1, dp(height)))
    }

    private fun showError(error: Exception) {
        mainHandler.post {
            if (!isAttachedToWindow) return@post
            loading = false
            if (error is ApiException && error.statusCode == 401) {
                onSessionExpired()
                return@post
            }
            loadError = error.message ?: "Something went wrong. Please try again."
            renderTab()
        }
    }

    private fun greeting(): String {
        val hour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)
        val salutation = when (hour) {
            in 5..11 -> "Good morning"
            in 12..17 -> "Good afternoon"
            else -> "Good evening"
        }
        return "$salutation, ${user.name}"
    }

    private fun openPage(url: String) {
        try {
            context.startActivity(android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url)))
        } catch (_: android.content.ActivityNotFoundException) {
            showMessage("Couldn't open this page.")
        }
    }

    private fun showMessage(text: String) {
        Toast.makeText(context, text, Toast.LENGTH_LONG).show()
    }

    private fun performLogout() {
        try {
            repository.logout()
            onLogout()
        } catch (error: SessionStorageException) {
            showMessage(error.message ?: "Couldn't clear your saved session.")
        }
    }

    private fun matchWidth() = LayoutParams(MATCH_PARENT, WRAP_CONTENT)
    private fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()
    private fun rounded(color: Int, radius: Int) = GradientDrawable().apply {
        setColor(color)
        cornerRadius = dp(radius).toFloat()
    }

    private companion object {
        const val MAX_PROFILE_PHOTO_BYTES = 10 * 1_024 * 1_024
        const val MATCH_PARENT = ViewGroup.LayoutParams.MATCH_PARENT
        const val WRAP_CONTENT = ViewGroup.LayoutParams.WRAP_CONTENT
    }
}
