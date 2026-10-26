package com.example.elovia

import android.app.DatePickerDialog
import android.content.ActivityNotFoundException
import android.content.res.ColorStateList
import android.content.Intent
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.text.InputType
import android.util.Patterns
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.widget.ArrayAdapter
import android.widget.CheckBox
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat
import com.example.elovia.auth.ApiException
import com.example.elovia.auth.AuthRepository
import com.example.elovia.auth.AuthSession
import com.example.elovia.auth.AuthUser
import com.example.elovia.auth.SessionRestore
import com.example.elovia.auth.SessionStorageException
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.MaterialAutoCompleteTextView
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class MainActivity : AppCompatActivity() {
    private enum class Screen { SPLASH, WELCOME, LOGIN, SIGNUP, FORGOT_PASSWORD, APP, RESTORE_ERROR }
    private data class FormField(val layout: TextInputLayout, val input: TextInputEditText)

    private val worker: ExecutorService = Executors.newSingleThreadExecutor()
    private val mainHandler = Handler(Looper.getMainLooper())
    private lateinit var auth: AuthRepository
    private lateinit var photoPicker: ActivityResultLauncher<String>
    private var screen = Screen.SPLASH
    private var currentUser: AuthUser? = null
    private var authenticatedApp: AuthenticatedAppView? = null
    private var restoreError = ""
    private val IVORY get() = ContextCompat.getColor(this, R.color.app_background)
    private val ROSE get() = ContextCompat.getColor(this, R.color.brand_end)
    private val PLUM get() = ContextCompat.getColor(this, R.color.brand_text)
    private val CHARCOAL get() = ContextCompat.getColor(this, R.color.app_text_primary)
    private val MUTED get() = ContextCompat.getColor(this, R.color.app_text_secondary)
    private val PALE_ROSE get() = ContextCompat.getColor(this, R.color.app_tint)
    private val SURFACE get() = ContextCompat.getColor(this, R.color.app_surface)
    private val ON_ACCENT get() = ContextCompat.getColor(this, R.color.app_on_accent)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        auth = AuthRepository(applicationContext)
        photoPicker = registerForActivityResult(ActivityResultContracts.GetContent()) { uri ->
            uri?.let { authenticatedApp?.uploadProfilePhoto(it) }
        }
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                when (screen) {
                    Screen.LOGIN, Screen.SIGNUP, Screen.FORGOT_PASSWORD -> showWelcome()
                    Screen.RESTORE_ERROR -> restoreSession()
                    Screen.APP -> if (authenticatedApp?.handleBack() != true) finish()
                    else -> finish()
                }
            }
        })
        showSplash()
        restoreSession()
    }

    override fun onDestroy() {
        worker.shutdownNow()
        super.onDestroy()
    }

    private fun restoreSession() {
        screen = Screen.SPLASH
        render()
        worker.execute {
            val result = auth.restoreSession()
            mainHandler.post {
                if (isFinishing || isDestroyed) return@post
                when (result) {
                    is SessionRestore.Authenticated -> showHome(result.session)
                    SessionRestore.Unauthenticated -> showWelcome()
                    is SessionRestore.Unavailable -> {
                        restoreError = result.message
                        screen = Screen.RESTORE_ERROR
                        render()
                    }
                }
            }
        }
    }

    private fun showSplash() {
        screen = Screen.SPLASH
        render()
    }

    private fun showWelcome() {
        screen = Screen.WELCOME
        currentUser = null
        authenticatedApp = null
        render()
    }

    private fun showHome(session: AuthSession) {
        currentUser = session.user
        screen = Screen.APP
        render()
    }

    private fun render() {
        if (screen == Screen.APP) {
            authenticatedApp = AuthenticatedAppView(
                this,
                currentUser ?: AuthUser("", "there", ""),
                auth,
                onRequestPhoto = { photoPicker.launch("image/*") },
                onLogout = { showWelcome() },
                onSessionExpired = {
                    try {
                        auth.logout()
                        showWelcome()
                    } catch (error: SessionStorageException) {
                        Toast.makeText(this, error.message, Toast.LENGTH_LONG).show()
                    }
                }
            )
            setContentView(authenticatedApp)
            return
        }
        val scroll = ScrollView(this).apply {
            isFillViewport = true
            clipToPadding = false
            setBackgroundColor(IVORY)
        }
        val content = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER_HORIZONTAL
            setPadding(dp(24), dp(24), dp(24), dp(36))
        }
        scroll.addView(
            content,
            ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
        )
        ViewCompat.setOnApplyWindowInsetsListener(content) { view, insets ->
            val bars = insets.getInsets(WindowInsetsCompat.Type.systemBars())
            view.setPadding(
                dp(24) + bars.left,
                dp(24) + bars.top,
                dp(24) + bars.right,
                dp(36) + bars.bottom
            )
            insets
        }
        setContentView(scroll)

        when (screen) {
            Screen.SPLASH -> buildSplash(content)
            Screen.WELCOME -> buildWelcome(content)
            Screen.LOGIN -> buildLogin(content)
            Screen.SIGNUP -> buildSignup(content)
            Screen.FORGOT_PASSWORD -> buildForgotPassword(content)
            Screen.APP -> Unit
            Screen.RESTORE_ERROR -> buildRestoreError(content)
        }
    }

    private fun buildSplash(parent: LinearLayout) {
        addVerticalSpace(parent, 108)
        brandMark(parent, centered = true)
        parent.getChildAt(1)?.apply {
            alpha = 0f
            scaleX = 0.92f
            scaleY = 0.92f
            animate().alpha(1f).scaleX(1f).scaleY(1f).setDuration(450).start()
        }
        addVerticalSpace(parent, 32)
        addText(parent, "Where meaningful connections begin.", 17, MUTED, centered = true)
        addVerticalSpace(parent, 24)
        parent.addView(android.widget.ProgressBar(this).apply {
            indeterminateTintList = ContextCompat.getColorStateList(this@MainActivity, R.color.brand_end)
            contentDescription = "Checking your secure session"
        })
    }

    private fun buildWelcome(parent: LinearLayout) {
        brandMark(parent)
        addVerticalSpace(parent, 28)
        buildHero(parent)
        addVerticalSpace(parent, 26)
        addText(parent, "Find Your Kind of Love", 30, CHARCOAL, bold = true, centered = true)
        addVerticalSpace(parent, 10)
        addText(
            parent,
            "Meet genuine people, build meaningful connections, and discover where your story leads.",
            16,
            MUTED,
            centered = true
        )
        addVerticalSpace(parent, 26)
        parent.addView(primaryButton("Create Account") { screen = Screen.SIGNUP; render() }, matchWidth())
        addVerticalSpace(parent, 12)
        parent.addView(secondaryButton("Log In") { screen = Screen.LOGIN; render() }, matchWidth())
        addVerticalSpace(parent, 20)
        addLegalLinks(parent)
        addText(parent, "By continuing, you agree to our Terms of Service and Privacy Policy.", 12, MUTED, centered = true)
    }

    private fun buildHero(parent: LinearLayout) {
        val frame = FrameLayout(this).apply {
            background = rounded(PALE_ROSE, 30)
            contentDescription = "An illustration of two people sharing a meaningful connection"
        }
        val heart = TextView(this).apply {
            text = "♥"
            textSize = 98f
            setTextColor(PLUM)
            this.gravity = Gravity.CENTER
            typeface = Typeface.create("sans-serif", Typeface.BOLD)
        }
        frame.addView(
            heart,
            FrameLayout.LayoutParams(dp(190), dp(190), Gravity.CENTER)
        )
        addFloatingHeart(frame, "✦", Gravity.TOP or Gravity.END, ROSE, 25)
        addFloatingHeart(frame, "♥", Gravity.BOTTOM or Gravity.START, PLUM, 26)
        val caption = TextView(this).apply {
            text = "made for the moments that matter"
            textSize = 13f
            setTextColor(PLUM)
            gravity = Gravity.CENTER
            typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
        }
        frame.addView(
            caption,
            FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(40), Gravity.BOTTOM)
        )
        parent.addView(frame, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(266)))
    }

    private fun addFloatingHeart(frame: FrameLayout, symbol: String, gravity: Int, color: Int, size: Int) {
        val decoration = TextView(this).apply {
            text = symbol
            textSize = size.toFloat()
            setTextColor(color)
            this.gravity = Gravity.CENTER
            contentDescription = null
        }
        val params = FrameLayout.LayoutParams(dp(62), dp(62), gravity).apply {
            setMargins(dp(26), dp(24), dp(26), dp(48))
        }
        frame.addView(decoration, params)
    }

    private fun buildLogin(parent: LinearLayout) {
        addBackButton(parent, "Back to welcome") { showWelcome() }
        addVerticalSpace(parent, 14)
        brandMark(parent)
        addVerticalSpace(parent, 26)
        addText(parent, "Welcome Back", 29, CHARCOAL, bold = true)
        addVerticalSpace(parent, 6)
        addText(parent, "Your next meaningful connection starts here.", 15, MUTED)
        addVerticalSpace(parent, 24)

        val email = addInput(parent, "Email address", InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS)
        email.input.imeOptions = EditorInfo.IME_ACTION_NEXT
        email.input.setAutofillHints(android.view.View.AUTOFILL_HINT_EMAIL_ADDRESS)
        val password = addInput(
            parent,
            "Password",
            InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD,
            passwordToggle = true
        )
        password.input.imeOptions = EditorInfo.IME_ACTION_DONE
        password.input.setAutofillHints(android.view.View.AUTOFILL_HINT_PASSWORD)
        addLink(parent, "Forgot Password?") {
            screen = Screen.FORGOT_PASSWORD
            render()
        }
        addVerticalSpace(parent, 20)
        val authError = addAuthError(parent)
        val loginButton = primaryButton("Log In") {}
        loginButton.setOnClickListener {
            val address = email.input.text?.toString()?.trim().orEmpty()
            val secret = password.input.text?.toString().orEmpty()
            email.layout.error = null
            password.layout.error = null
            var valid = true
            if (!Patterns.EMAIL_ADDRESS.matcher(address).matches()) {
                email.layout.error = "Enter a valid email address"
                valid = false
            }
            if (secret.isBlank()) {
                password.layout.error = "Enter your password"
                valid = false
            }
            if (valid) performAuthentication(loginButton, authError, "Signing in…") {
                auth.login(address, secret)
            }
        }
        parent.addView(loginButton, matchWidth())
        addVerticalSpace(parent, 22)
        addText(parent, "Don't have an account?", 15, MUTED, centered = true)
        addLink(parent, "Sign Up", centered = true) { screen = Screen.SIGNUP; render() }
    }

    private fun buildSignup(parent: LinearLayout) {
        addBackButton(parent, "Back to welcome") { showWelcome() }
        addVerticalSpace(parent, 14)
        brandMark(parent)
        addVerticalSpace(parent, 24)
        addText(parent, "Create Your Account", 28, CHARCOAL, bold = true)
        addVerticalSpace(parent, 6)
        addText(parent, "Start your journey toward a meaningful connection.", 15, MUTED)
        addVerticalSpace(parent, 22)

        val name = addInput(parent, "Full name", InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PERSON_NAME)
        name.input.imeOptions = EditorInfo.IME_ACTION_NEXT
        name.input.setAutofillHints(android.view.View.AUTOFILL_HINT_NAME)
        val email = addInput(parent, "Email address", InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS)
        email.input.imeOptions = EditorInfo.IME_ACTION_NEXT
        email.input.setAutofillHints(android.view.View.AUTOFILL_HINT_EMAIL_ADDRESS)
        val password = addInput(
            parent,
            "Password (at least 6 characters)",
            InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD,
            passwordToggle = true
        )
        password.input.imeOptions = EditorInfo.IME_ACTION_NEXT
        password.input.setAutofillHints("newPassword")
        val confirm = addInput(
            parent,
            "Confirm password",
            InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD,
            passwordToggle = true
        )
        confirm.input.imeOptions = EditorInfo.IME_ACTION_NEXT

        val dateOfBirth = TextInputLayout(this).apply {
            hint = "Date of birth (18+)"
            boxBackgroundMode = TextInputLayout.BOX_BACKGROUND_OUTLINE
            boxBackgroundColor = SURFACE
            boxStrokeColor = ROSE
            setDefaultHintTextColor(ColorStateList.valueOf(MUTED))
        }
        val dateInput = TextInputEditText(dateOfBirth.context).apply {
            isFocusable = false
            isClickable = true
            isLongClickable = false
            inputType = InputType.TYPE_NULL
            setTextColor(CHARCOAL)
            contentDescription = "Choose date of birth"
        }
        dateOfBirth.addView(dateInput)
        dateOfBirth.setOnClickListener { showDatePicker(dateInput, dateOfBirth) }
        dateInput.setOnClickListener { showDatePicker(dateInput, dateOfBirth) }
        parent.addView(dateOfBirth, matchWidth())
        addVerticalSpace(parent, 16)

        val genderField = TextInputLayout(this).apply {
            hint = "Gender"
            boxBackgroundMode = TextInputLayout.BOX_BACKGROUND_OUTLINE
            boxBackgroundColor = SURFACE
            boxStrokeColor = ROSE
            setDefaultHintTextColor(ColorStateList.valueOf(MUTED))
            setEndIconMode(TextInputLayout.END_ICON_DROPDOWN_MENU)
        }
        val genderInput = MaterialAutoCompleteTextView(genderField.context).apply {
            setAdapter(ArrayAdapter(this@MainActivity, android.R.layout.simple_list_item_1, GENDERS))
            threshold = 0
            inputType = InputType.TYPE_NULL
            setTextColor(CHARCOAL)
            setOnClickListener { showDropDown() }
            imeOptions = EditorInfo.IME_ACTION_DONE
        }
        genderField.addView(genderInput)
        parent.addView(genderField, matchWidth())
        addVerticalSpace(parent, 8)

        val acceptedTerms = CheckBox(this).apply {
            text = "I agree to the Terms of Service and Privacy Policy"
            textSize = 14f
            setTextColor(CHARCOAL)
            buttonTintList = ContextCompat.getColorStateList(this@MainActivity, R.color.brand_end)
            minHeight = dp(48)
            contentDescription = "Agree to the Terms of Service and Privacy Policy"
        }
        parent.addView(acceptedTerms, matchWidth())
        addLegalLinks(parent)
        addVerticalSpace(parent, 14)

        val authError = addAuthError(parent)
        val createButton = primaryButton("Create Account") {}
        createButton.setOnClickListener {
            listOf(name.layout, email.layout, password.layout, confirm.layout, dateOfBirth, genderField).forEach { it.error = null }
            var valid = true
            val fullName = name.input.text?.toString()?.trim().orEmpty()
            val address = email.input.text?.toString()?.trim().orEmpty()
            val secret = password.input.text?.toString().orEmpty()
            val confirmation = confirm.input.text?.toString().orEmpty()
            val birthday = parseBirthday(dateInput.text?.toString().orEmpty())
            val selectedGender = genderInput.text?.toString()?.trim().orEmpty()

            if (fullName.length !in 2..50) {
                name.layout.error = "Name must be 2–50 characters"
                valid = false
            }
            if (!Patterns.EMAIL_ADDRESS.matcher(address).matches()) {
                email.layout.error = "Enter a valid email address"
                valid = false
            }
            if (secret.length < MIN_PASSWORD_LENGTH) {
                password.layout.error = "Password must be at least 6 characters"
                valid = false
            }
            if (confirmation != secret || confirmation.isEmpty()) {
                confirm.layout.error = "Passwords don't match"
                valid = false
            }
            if (birthday == null || !isAdult(birthday)) {
                dateOfBirth.error = "You must be at least 18 years old"
                valid = false
            }
            if (selectedGender !in GENDERS) {
                genderField.error = "Choose a gender"
                valid = false
            }
            if (!acceptedTerms.isChecked) {
                acceptedTerms.error = "Please accept the Terms and Privacy Policy"
                valid = false
            } else {
                acceptedTerms.error = null
            }

            if (valid && birthday != null) {
                val date = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(birthday)
                performAuthentication(createButton, authError, "Creating account…") {
                    auth.register(fullName, address, secret, date, selectedGender)
                }
            }
        }
        parent.addView(createButton, matchWidth())
        addVerticalSpace(parent, 20)
        addText(parent, "Already have an account?", 15, MUTED, centered = true)
        addLink(parent, "Log In", centered = true) { screen = Screen.LOGIN; render() }
    }

    private fun buildForgotPassword(parent: LinearLayout) {
        addBackButton(parent, "Back to login") { screen = Screen.LOGIN; render() }
        addVerticalSpace(parent, 24)
        brandMark(parent)
        addVerticalSpace(parent, 28)
        addText(parent, "Password reset", 29, CHARCOAL, bold = true)
        addVerticalSpace(parent, 12)
        addText(
            parent,
            "Password reset isn't available in the existing Elovia Love backend yet. No reset request has been sent. Please contact support or try again later.",
            16,
            MUTED
        )
        addVerticalSpace(parent, 26)
        parent.addView(secondaryButton("Return to Log In") { screen = Screen.LOGIN; render() }, matchWidth())
    }

    private fun buildRestoreError(parent: LinearLayout) {
        brandMark(parent)
        addVerticalSpace(parent, 36)
        addText(parent, "Can't verify your session", 26, CHARCOAL, bold = true, centered = true)
        addVerticalSpace(parent, 12)
        addText(parent, restoreError, 15, MUTED, centered = true)
        addVerticalSpace(parent, 24)
        parent.addView(primaryButton("Try Again") { restoreSession() }, matchWidth())
        addVerticalSpace(parent, 12)
        parent.addView(secondaryButton("Continue without signing in") { continueWithoutSession() }, matchWidth())
    }

    private fun performAuthentication(
        button: MaterialButton,
        errorLabel: TextView,
        loadingText: String,
        action: () -> AuthSession
    ) {
        button.isEnabled = false
        errorLabel.visibility = View.GONE
        val originalText = button.text
        button.text = loadingText
        worker.execute {
            try {
                val session = action()
                mainHandler.post {
                    if (!isFinishing && !isDestroyed) showHome(session)
                }
            } catch (error: ApiException) {
                showAuthFailure(
                    button,
                    errorLabel,
                    originalText,
                    error.message ?: "Something went wrong. Please try again."
                )
            } catch (error: SessionStorageException) {
                showAuthFailure(
                    button,
                    errorLabel,
                    originalText,
                    error.message ?: "Couldn't securely save your session."
                )
            }
        }
    }

    private fun showAuthFailure(
        button: MaterialButton,
        errorLabel: TextView,
        originalText: CharSequence,
        message: String
    ) {
        mainHandler.post {
            if (isFinishing || isDestroyed) return@post
            button.isEnabled = true
            button.text = originalText
            errorLabel.text = message
            errorLabel.visibility = View.VISIBLE
        }
    }

    private fun continueWithoutSession() {
        try {
            auth.logout()
            showWelcome()
        } catch (error: SessionStorageException) {
            Toast.makeText(this, error.message, Toast.LENGTH_LONG).show()
        }
    }

    private fun showDatePicker(field: TextInputEditText, container: TextInputLayout) {
        val calendar = Calendar.getInstance()
        calendar.add(Calendar.YEAR, -25)
        val existingDate = parseBirthday(field.text?.toString().orEmpty())
        if (existingDate != null) calendar.time = existingDate
        val maximum = Calendar.getInstance().apply { add(Calendar.YEAR, -18) }
        DatePickerDialog(
            this,
            { _, year, month, day ->
                val selected = Calendar.getInstance().apply {
                    set(year, month, day, 12, 0, 0)
                    set(Calendar.MILLISECOND, 0)
                }.time
                field.setText(SimpleDateFormat("MMM d, yyyy", Locale.getDefault()).format(selected))
                container.error = null
            },
            calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH)
        ).apply {
            datePicker.maxDate = maximum.timeInMillis
            setTitle("Select your date of birth")
        }.show()
    }

    private fun parseBirthday(value: String): Date? {
        if (value.isBlank()) return null
        return try {
            SimpleDateFormat("MMM d, yyyy", Locale.getDefault()).apply { isLenient = false }.parse(value)
        } catch (_: java.text.ParseException) {
            null
        }
    }

    private fun isAdult(birthday: Date): Boolean {
        val cutoff = Calendar.getInstance().apply { add(Calendar.YEAR, -18) }
        return !birthday.after(cutoff.time)
    }

    private fun addInput(
        parent: LinearLayout,
        label: String,
        inputType: Int,
        passwordToggle: Boolean = false
    ): FormField {
        val container = TextInputLayout(this).apply {
            hint = label
            boxBackgroundMode = TextInputLayout.BOX_BACKGROUND_OUTLINE
            boxBackgroundColor = SURFACE
            boxStrokeColor = ROSE
            setDefaultHintTextColor(ColorStateList.valueOf(MUTED))
            if (passwordToggle) setEndIconMode(TextInputLayout.END_ICON_PASSWORD_TOGGLE)
        }
        val input = TextInputEditText(container.context).apply {
            this.inputType = inputType
            setTextColor(CHARCOAL)
            textSize = 16f
            maxLines = 1
            imeOptions = EditorInfo.IME_ACTION_NEXT
            contentDescription = label
        }
        container.addView(input)
        parent.addView(container, matchWidth())
        addVerticalSpace(parent, 16)
        return FormField(container, input)
    }

    private fun addAuthError(parent: LinearLayout): TextView {
        val error = TextView(this).apply {
            setTextColor(ContextCompat.getColor(this@MainActivity, R.color.app_error))
            textSize = 14f
            visibility = View.GONE
            setPadding(dp(4), dp(8), dp(4), dp(12))
            accessibilityLiveRegion = View.ACCESSIBILITY_LIVE_REGION_POLITE
        }
        parent.addView(error, matchWidth())
        return error
    }

    private fun addBackButton(parent: LinearLayout, label: String, action: () -> Unit) {
        val back = MaterialButton(this, null, com.google.android.material.R.attr.materialButtonOutlinedStyle).apply {
            text = "‹   $label"
            textSize = 14f
            isAllCaps = false
            setTextColor(PLUM)
            strokeColor = ContextCompat.getColorStateList(this@MainActivity, R.color.pale_rose)
            strokeWidth = dp(1)
            cornerRadius = dp(16)
            contentDescription = label
            setOnClickListener { action() }
        }
        parent.addView(back, LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, dp(46)))
        back.layoutParams = (back.layoutParams as LinearLayout.LayoutParams).apply { gravity = Gravity.START }
    }

    private fun brandMark(parent: LinearLayout, centered: Boolean = false) {
        val line = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = if (centered) Gravity.CENTER else Gravity.START or Gravity.CENTER_VERTICAL
        }
        val heart = TextView(this).apply {
            text = "♥"
            textSize = 22f
            setTextColor(ON_ACCENT)
            gravity = Gravity.CENTER
            background = rounded(ROSE, 16)
            contentDescription = "Elovia Love"
        }
        line.addView(heart, LinearLayout.LayoutParams(dp(42), dp(42)))
        val title = TextView(this).apply {
            text = "Elovia Love"
            textSize = 21f
            setTextColor(PLUM)
            typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
            setPadding(dp(10), 0, 0, 0)
        }
        line.addView(title, LinearLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT))
        parent.addView(line, LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, dp(48)))
        if (centered) line.gravity = Gravity.CENTER
    }

    private fun addLegalLinks(parent: LinearLayout) {
        val links = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
        }
        links.addView(legalLink("Terms of Service", TERMS_URL))
        links.addView(TextView(this).apply {
            text = "   ·   "
            setTextColor(MUTED)
            textSize = 13f
        })
        links.addView(legalLink("Privacy Policy", PRIVACY_URL))
        parent.addView(links, matchWidth())
        addVerticalSpace(parent, 10)
    }

    private fun legalLink(label: String, url: String) = TextView(this).apply {
        text = label
        textSize = 13f
        setTextColor(PLUM)
        paint.isUnderlineText = true
        isFocusable = true
        setOnClickListener { openWebPage(url) }
    }

    private fun openWebPage(url: String) {
        try {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
        } catch (_: ActivityNotFoundException) {
            Toast.makeText(this, "No browser is available to open this page.", Toast.LENGTH_LONG).show()
        }
    }

    private fun addLink(parent: LinearLayout, label: String, centered: Boolean = false, action: () -> Unit) {
        val link = TextView(this).apply {
            text = label
            textSize = 15f
            setTextColor(PLUM)
            typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
            gravity = if (centered) Gravity.CENTER else Gravity.END
            isFocusable = true
            setPadding(dp(8), dp(12), dp(8), dp(12))
            setOnClickListener { action() }
        }
        parent.addView(link, matchWidth())
    }

    private fun primaryButton(label: String, action: () -> Unit) =
        MaterialButton(this).apply {
            text = label
            textSize = 16f
            isAllCaps = false
            cornerRadius = dp(18)
            insetTop = 0
            insetBottom = 0
            background = GradientDrawable(
                GradientDrawable.Orientation.LEFT_RIGHT,
                intArrayOf(
                    ContextCompat.getColor(this@MainActivity, R.color.brand_start),
                    ContextCompat.getColor(this@MainActivity, R.color.brand_end)
                )
            ).apply { cornerRadius = dp(18).toFloat() }
            setTextColor(ON_ACCENT)
            minHeight = dp(56)
            contentDescription = label
            setOnClickListener { action() }
        }

    private fun secondaryButton(label: String, action: () -> Unit) =
        MaterialButton(this, null, com.google.android.material.R.attr.materialButtonOutlinedStyle).apply {
            text = label
            textSize = 16f
            isAllCaps = false
            cornerRadius = dp(18)
            insetTop = 0
            insetBottom = 0
            strokeColor = ContextCompat.getColorStateList(this@MainActivity, R.color.brand_end)
            strokeWidth = dp(1)
            setTextColor(PLUM)
            minHeight = dp(56)
            contentDescription = label
            setOnClickListener { action() }
        }

    private fun addText(
        parent: LinearLayout,
        value: String,
        size: Int,
        color: Int,
        bold: Boolean = false,
        centered: Boolean = false
    ) {
        val label = TextView(this).apply {
            text = value
            textSize = size.toFloat()
            setTextColor(color)
            gravity = if (centered) Gravity.CENTER else Gravity.START
            if (bold) typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
            if (centered) setPadding(dp(8), 0, dp(8), 0)
        }
        parent.addView(label, matchWidth())
    }

    private fun addVerticalSpace(parent: LinearLayout, height: Int) {
        parent.addView(View(this), LinearLayout.LayoutParams(1, dp(height)))
    }

    private fun matchWidth() =
        LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)

    private fun rounded(color: Int, radius: Int) = GradientDrawable().apply {
        setColor(color)
        cornerRadius = dp(radius).toFloat()
    }

    private fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()

    private companion object {
        const val MIN_PASSWORD_LENGTH = 6
        val GENDERS = listOf("Male", "Female", "Non-binary")
        const val TERMS_URL = "https://elovialove.onrender.com/terms"
        const val PRIVACY_URL = "https://elovialove.onrender.com/privacy"
    }
}
