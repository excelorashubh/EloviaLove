plugins {
    alias(libs.plugins.android.application)
}

val mobileApiBaseUrl = providers.environmentVariable("ELOVIA_API_BASE_URL")
    .orElse(providers.gradleProperty("apiBaseUrl"))
    .getOrElse("https://elovialove-server.onrender.com")
    .trim()

android {
    namespace = "com.example.elovia"
    compileSdk {
        version = release(37)
    }

    defaultConfig {
        applicationId = "com.example.elovia"
        minSdk = 29
        targetSdk = 37
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        buildConfigField(
            "String",
            "API_BASE_URL",
            "\"${mobileApiBaseUrl.replace("\\", "\\\\").replace("\"", "\\\"")}\""
        )
    }

    buildTypes {
        release {
            optimization {
                enable = true
                packageScope = setOf("androidx.**", "kotlin.**", "kotlinx.**")
            }
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    buildFeatures {
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.activity.ktx)
    implementation(libs.androidx.appcompat)
    implementation(libs.androidx.constraintlayout)
    implementation(libs.androidx.core.ktx)
    implementation(libs.glide)
    implementation(libs.material)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.junit)
}