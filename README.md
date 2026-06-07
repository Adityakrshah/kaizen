
```
kaizen
├─ client
│  ├─ README.md
│  ├─ components.json
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ favicon.svg
│  │  └─ icons.svg
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.tsx
│  │  ├─ app
│  │  │  ├─ providers
│  │  │  │  └─ QueryProvider.tsx
│  │  │  ├─ routes
│  │  │  │  └─ AppRoutes.tsx
│  │  │  └─ store
│  │  ├─ assets
│  │  │  ├─ hero.png
│  │  │  ├─ react.svg
│  │  │  └─ vite.svg
│  │  ├─ components
│  │  │  ├─ ProtectedRoute.tsx
│  │  │  ├─ landing
│  │  │  │  ├─ Features.tsx
│  │  │  │  ├─ Footer.tsx
│  │  │  │  ├─ Hero.tsx
│  │  │  │  ├─ Modules.tsx
│  │  │  │  ├─ Pricing.tsx
│  │  │  │  └─ Testimonials.tsx
│  │  │  ├─ navbar
│  │  │  │  └─ Navbar.tsx
│  │  │  ├─ theme-provider.tsx
│  │  │  └─ ui
│  │  │     ├─ avatar.tsx
│  │  │     ├─ badge.tsx
│  │  │     ├─ button.tsx
│  │  │     ├─ card.tsx
│  │  │     ├─ checkbox.tsx
│  │  │     ├─ dialog.tsx
│  │  │     ├─ dropdown-menu.tsx
│  │  │     ├─ form.tsx
│  │  │     ├─ input.tsx
│  │  │     ├─ label.tsx
│  │  │     ├─ progress.tsx
│  │  │     ├─ radio-group.tsx
│  │  │     ├─ select.tsx
│  │  │     ├─ separator.tsx
│  │  │     ├─ sheet.tsx
│  │  │     ├─ slider.tsx
│  │  │     ├─ switch.tsx
│  │  │     ├─ tabs.tsx
│  │  │     └─ textarea.tsx
│  │  ├─ features
│  │  │  ├─ dashboard
│  │  │  │  └─ hooks
│  │  │  │     └─ useProgress.ts
│  │  │  ├─ listening
│  │  │  │  ├─ api
│  │  │  │  │  └─ listening.api.ts
│  │  │  │  └─ hooks
│  │  │  │     └─ useListening.ts
│  │  │  ├─ mocktest
│  │  │  ├─ reading
│  │  │  ├─ settings
│  │  │  │  └─ hooks
│  │  │  │     └─ useProfile.ts
│  │  │  ├─ speaking
│  │  │  │  ├─ api
│  │  │  │  │  └─ speaking.api.ts
│  │  │  │  └─ hooks
│  │  │  │     └─ useSubmitSpeaking.ts
│  │  │  ├─ vocabulary
│  │  │  └─ writing
│  │  ├─ index.css
│  │  ├─ layouts
│  │  │  └─ AppLayout.tsx
│  │  ├─ lib
│  │  │  ├─ auth-client.ts
│  │  │  └─ utils.ts
│  │  ├─ main.tsx
│  │  ├─ pages
│  │  │  ├─ Dashboard.tsx
│  │  │  ├─ Landing.tsx
│  │  │  ├─ Listening.tsx
│  │  │  ├─ Login.tsx
│  │  │  ├─ MockTest.tsx
│  │  │  ├─ MockTestResult.tsx
│  │  │  ├─ Profile.tsx
│  │  │  ├─ Reading.tsx
│  │  │  ├─ Settings.tsx
│  │  │  ├─ Signup.tsx
│  │  │  ├─ Speaking.tsx
│  │  │  ├─ Vocabulary.tsx
│  │  │  └─ Writing.tsx
│  │  └─ shared
│  │     ├─ api
│  │     │  ├─ api.ts
│  │     │  └─ endpoints.ts
│  │     ├─ components
│  │     ├─ hooks
│  │     │  └─ useAuth.ts
│  │     └─ utils
│  │        └─ helpers.ts
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  └─ vite.config.ts
├─ package-lock.json
└─ server
   ├─ package-lock.json
   ├─ package.json
   ├─ src
   │  ├─ app.ts
   │  ├─ config
   │  │  ├─ auth.ts
   │  │  └─ database.ts
   │  ├─ controllers
   │  │  ├─ listening.controller.ts
   │  │  ├─ mocktest.controller.ts
   │  │  ├─ profile.controller.ts
   │  │  ├─ progress.controller.ts
   │  │  ├─ reading.controller.ts
   │  │  ├─ settings.controller.ts
   │  │  ├─ speaking.controller.ts
   │  │  ├─ vocabulary.controller.ts
   │  │  └─ writing.controller.ts
   │  ├─ data
   │  │  ├─ full-word.json
   │  │  ├─ hard.js
   │  │  ├─ high-frequency-gre.js
   │  │  ├─ intermediate.js
   │  │  ├─ reading
   │  │  │  └─ cefr_leveled_texts.csv
   │  │  ├─ speaking_read-a-loud.json
   │  │  ├─ vocab_fill_in_blanks_dragNdrop.json
   │  │  ├─ vocab_fill_in_blanks_dropdown.json
   │  │  ├─ vocab_listening_fill_in_blanks.json
   │  │  ├─ vocab_write_from_dictation.json
   │  │  └─ warm-up.js
   │  ├─ middleware
   │  │  ├─ auth.middleware.ts
   │  │  ├─ error.middleware.ts
   │  │  ├─ rateLimit.middleware.ts
   │  │  ├─ upload.middleware.ts
   │  │  └─ validate.middleware.ts
   │  ├─ models
   │  │  ├─ ieltslistening.model.ts
   │  │  ├─ ieltsspeaking.model.ts
   │  │  ├─ listening.model.ts
   │  │  ├─ listeningResult.model.ts
   │  │  ├─ mocktest.model.ts
   │  │  ├─ profile.model.ts
   │  │  ├─ progress.model.ts
   │  │  ├─ reading.model.ts
   │  │  ├─ readingResult.model.ts
   │  │  ├─ settings.model.ts
   │  │  ├─ speaking.model.ts
   │  │  ├─ speakingPrompt.model.ts
   │  │  ├─ speakingResult.model.ts
   │  │  ├─ user.model.ts
   │  │  ├─ userVocab.model.ts
   │  │  ├─ vocabulary.model.ts
   │  │  ├─ vocabularyExercise.model.ts
   │  │  ├─ writing.model.ts
   │  │  └─ writingprompt.model.ts
   │  ├─ routes
   │  │  ├─ listening.routes.ts
   │  │  ├─ mocktest.routes.ts
   │  │  ├─ profile.routes.ts
   │  │  ├─ progress.routes.ts
   │  │  ├─ reading.routes.ts
   │  │  ├─ settings.routes.ts
   │  │  ├─ speaking.routes.ts
   │  │  ├─ system.routes.ts
   │  │  ├─ vocabulary.routes.ts
   │  │  └─ writing.routes.ts
   │  ├─ scripts
   │  │  └─ seed.ts
   │  ├─ server.ts
   │  ├─ services
   │  │  ├─ ai.service.ts
   │  │  ├─ listening.service.ts
   │  │  ├─ mocktest.service.ts
   │  │  ├─ profile.service.ts
   │  │  ├─ progress.service.ts
   │  │  ├─ reading.service.ts
   │  │  ├─ settings.service.ts
   │  │  ├─ speaking.service.ts
   │  │  ├─ tts.service.ts
   │  │  ├─ vocabulary.service.ts
   │  │  ├─ whisper.service.ts
   │  │  └─ writing.service.ts
   │  ├─ utils
   │  │  ├─ ai-factory.ts
   │  │  ├─ mocktestseed.ts
   │  │  ├─ seedListening.ts
   │  │  ├─ seedReading.ts
   │  │  ├─ seedSpeaking.ts
   │  │  ├─ seedVocabulary.ts
   │  │  ├─ seedVocabularyExercises.ts
   │  │  └─ testTTS.ts
   │  └─ validators
   │     ├─ index.ts
   │     ├─ listening.validator.ts
   │     ├─ mocktest.validator.ts
   │     ├─ progress.validator.ts
   │     ├─ reading.validator.ts
   │     ├─ settings.validator.ts
   │     ├─ speaking.validator.ts
   │     ├─ vocabulary.validator.ts
   │     └─ writing.validator.ts
   ├─ tsconfig.json
   └─ uploads
      ├─ 1774731632022-recording.webm
      ├─ 1774731696459-recording.webm
      ├─ 1774731766836-recording.webm
      ├─ 1774760998637-recording.webm
      ├─ 1774982888600-recording.webm
      ├─ 1774982960582-recording.webm
      ├─ 1775066062811-recording.webm
      ├─ 1775152601624-recording.webm
      ├─ 1775153532740-recording.webm
      ├─ 1775153995771-recording.webm
      └─ listening
         ├─ listening-1774715670235.mp3
         ├─ listening-1774716360628.mp3
         ├─ listening-1774716463844.mp3
         ├─ listening-1774718337176.mp3
         ├─ listening-1774718452678.mp3
         ├─ listening-1774718489936.mp3
         ├─ listening-1774719860267.mp3
         ├─ listening-1774723930791.mp3
         ├─ listening-1774762728613.mp3
         ├─ listening-1774892544392.mp3
         ├─ listening-1774892547839.mp3
         ├─ listening-1774892550055.mp3
         ├─ listening-1774892694222.mp3
         ├─ listening-1774892698341.mp3
         ├─ listening-1774892701011.mp3
         ├─ listening-1774892703573.mp3
         ├─ listening-1774893918807.mp3
         ├─ listening-1774893928792.mp3
         ├─ listening-1774893937812.mp3
         ├─ listening-1774894130416.mp3
         ├─ listening-1774894139528.mp3
         ├─ listening-1774894148045.mp3
         ├─ listening-1774894165103.mp3
         ├─ listening-1775058899393.mp3
         └─ listening-1775065815390.mp3

```
```
kaizen
├─ README.md
├─ client
│  ├─ README.md
│  ├─ components.json
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ netlify.toml
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ public
│  │  ├─ _redirects
│  │  ├─ favicon.svg
│  │  └─ icons.svg
│  ├─ src
│  │  ├─ App.css
│  │  ├─ App.tsx
│  │  ├─ app
│  │  │  ├─ providers
│  │  │  │  └─ QueryProvider.tsx
│  │  │  ├─ routes
│  │  │  │  └─ AppRoutes.tsx
│  │  │  └─ store
│  │  ├─ assets
│  │  │  ├─ hero.png
│  │  │  ├─ react.svg
│  │  │  └─ vite.svg
│  │  ├─ components
│  │  │  ├─ ProtectedRoute.tsx
│  │  │  ├─ landing
│  │  │  │  ├─ Features.tsx
│  │  │  │  ├─ Footer.tsx
│  │  │  │  ├─ Hero.tsx
│  │  │  │  ├─ Modules.tsx
│  │  │  │  ├─ Pricing.tsx
│  │  │  │  └─ Testimonials.tsx
│  │  │  ├─ navbar
│  │  │  │  └─ Navbar.tsx
│  │  │  ├─ theme-provider.tsx
│  │  │  └─ ui
│  │  │     ├─ avatar.tsx
│  │  │     ├─ badge.tsx
│  │  │     ├─ button.tsx
│  │  │     ├─ card.tsx
│  │  │     ├─ checkbox.tsx
│  │  │     ├─ dialog.tsx
│  │  │     ├─ dropdown-menu.tsx
│  │  │     ├─ form.tsx
│  │  │     ├─ input.tsx
│  │  │     ├─ label.tsx
│  │  │     ├─ progress.tsx
│  │  │     ├─ radio-group.tsx
│  │  │     ├─ select.tsx
│  │  │     ├─ separator.tsx
│  │  │     ├─ sheet.tsx
│  │  │     ├─ slider.tsx
│  │  │     ├─ switch.tsx
│  │  │     ├─ tabs.tsx
│  │  │     └─ textarea.tsx
│  │  ├─ features
│  │  │  ├─ dashboard
│  │  │  │  └─ hooks
│  │  │  │     └─ useProgress.ts
│  │  │  ├─ listening
│  │  │  │  ├─ api
│  │  │  │  │  └─ listening.api.ts
│  │  │  │  └─ hooks
│  │  │  │     └─ useListening.ts
│  │  │  ├─ mocktest
│  │  │  ├─ reading
│  │  │  ├─ settings
│  │  │  │  └─ hooks
│  │  │  │     └─ useProfile.ts
│  │  │  ├─ speaking
│  │  │  │  ├─ api
│  │  │  │  │  └─ speaking.api.ts
│  │  │  │  └─ hooks
│  │  │  │     └─ useSubmitSpeaking.ts
│  │  │  ├─ vocabulary
│  │  │  └─ writing
│  │  ├─ index.css
│  │  ├─ layouts
│  │  │  └─ AppLayout.tsx
│  │  ├─ lib
│  │  │  ├─ auth-client.ts
│  │  │  └─ utils.ts
│  │  ├─ main.tsx
│  │  ├─ pages
│  │  │  ├─ Dashboard.tsx
│  │  │  ├─ Landing.tsx
│  │  │  ├─ Listening.tsx
│  │  │  ├─ Login.tsx
│  │  │  ├─ MockTest.tsx
│  │  │  ├─ MockTestResult.tsx
│  │  │  ├─ Profile.tsx
│  │  │  ├─ Reading.tsx
│  │  │  ├─ Settings.tsx
│  │  │  ├─ Signup.tsx
│  │  │  ├─ Speaking.tsx
│  │  │  ├─ Vocabulary.tsx
│  │  │  └─ Writing.tsx
│  │  └─ shared
│  │     ├─ api
│  │     │  ├─ api.ts
│  │     │  └─ endpoints.ts
│  │     ├─ components
│  │     ├─ hooks
│  │     │  └─ useAuth.ts
│  │     └─ utils
│  │        └─ helpers.ts
│  ├─ tsconfig.app.json
│  ├─ tsconfig.json
│  ├─ tsconfig.node.json
│  └─ vite.config.ts
├─ package-lock.json
└─ server
   ├─ package-lock.json
   ├─ package.json
   ├─ src
   │  ├─ app.ts
   │  ├─ config
   │  │  ├─ auth.ts
   │  │  └─ database.ts
   │  ├─ controllers
   │  │  ├─ listening.controller.ts
   │  │  ├─ mocktest.controller.ts
   │  │  ├─ profile.controller.ts
   │  │  ├─ progress.controller.ts
   │  │  ├─ reading.controller.ts
   │  │  ├─ settings.controller.ts
   │  │  ├─ speaking.controller.ts
   │  │  ├─ vocabulary.controller.ts
   │  │  └─ writing.controller.ts
   │  ├─ data
   │  │  ├─ full-word.json
   │  │  ├─ hard.js
   │  │  ├─ high-frequency-gre.js
   │  │  ├─ intermediate.js
   │  │  ├─ reading
   │  │  │  └─ cefr_leveled_texts.csv
   │  │  ├─ speaking_read-a-loud.json
   │  │  ├─ vocab_fill_in_blanks_dragNdrop.json
   │  │  ├─ vocab_fill_in_blanks_dropdown.json
   │  │  ├─ vocab_listening_fill_in_blanks.json
   │  │  ├─ vocab_write_from_dictation.json
   │  │  └─ warm-up.js
   │  ├─ middleware
   │  │  ├─ auth.middleware.ts
   │  │  ├─ error.middleware.ts
   │  │  ├─ rateLimit.middleware.ts
   │  │  ├─ upload.middleware.ts
   │  │  └─ validate.middleware.ts
   │  ├─ models
   │  │  ├─ ieltslistening.model.ts
   │  │  ├─ ieltsspeaking.model.ts
   │  │  ├─ listening.model.ts
   │  │  ├─ listeningResult.model.ts
   │  │  ├─ mocktest.model.ts
   │  │  ├─ profile.model.ts
   │  │  ├─ progress.model.ts
   │  │  ├─ reading.model.ts
   │  │  ├─ readingResult.model.ts
   │  │  ├─ settings.model.ts
   │  │  ├─ speaking.model.ts
   │  │  ├─ speakingPrompt.model.ts
   │  │  ├─ speakingResult.model.ts
   │  │  ├─ user.model.ts
   │  │  ├─ userVocab.model.ts
   │  │  ├─ vocabulary.model.ts
   │  │  ├─ vocabularyExercise.model.ts
   │  │  ├─ writing.model.ts
   │  │  └─ writingprompt.model.ts
   │  ├─ routes
   │  │  ├─ listening.routes.ts
   │  │  ├─ mocktest.routes.ts
   │  │  ├─ profile.routes.ts
   │  │  ├─ progress.routes.ts
   │  │  ├─ reading.routes.ts
   │  │  ├─ settings.routes.ts
   │  │  ├─ speaking.routes.ts
   │  │  ├─ system.routes.ts
   │  │  ├─ vocabulary.routes.ts
   │  │  └─ writing.routes.ts
   │  ├─ scripts
   │  │  └─ seed.ts
   │  ├─ server.ts
   │  ├─ services
   │  │  ├─ ai.service.ts
   │  │  ├─ listening.service.ts
   │  │  ├─ mocktest.service.ts
   │  │  ├─ profile.service.ts
   │  │  ├─ progress.service.ts
   │  │  ├─ reading.service.ts
   │  │  ├─ settings.service.ts
   │  │  ├─ speaking.service.ts
   │  │  ├─ tts.service.ts
   │  │  ├─ vocabulary.service.ts
   │  │  ├─ whisper.service.ts
   │  │  └─ writing.service.ts
   │  ├─ utils
   │  │  ├─ ai-factory.ts
   │  │  ├─ mocktestseed.ts
   │  │  ├─ seedListening.ts
   │  │  ├─ seedReading.ts
   │  │  ├─ seedSpeaking.ts
   │  │  ├─ seedVocabulary.ts
   │  │  ├─ seedVocabularyExercises.ts
   │  │  └─ testTTS.ts
   │  └─ validators
   │     ├─ index.ts
   │     ├─ listening.validator.ts
   │     ├─ mocktest.validator.ts
   │     ├─ progress.validator.ts
   │     ├─ reading.validator.ts
   │     ├─ settings.validator.ts
   │     ├─ speaking.validator.ts
   │     ├─ vocabulary.validator.ts
   │     └─ writing.validator.ts
   ├─ tsconfig.json
   └─ uploads
      ├─ 1774731632022-recording.webm
      ├─ 1774731696459-recording.webm
      ├─ 1774731766836-recording.webm
      ├─ 1774760998637-recording.webm
      ├─ 1774982888600-recording.webm
      ├─ 1774982960582-recording.webm
      ├─ 1775066062811-recording.webm
      ├─ 1775152601624-recording.webm
      ├─ 1775153532740-recording.webm
      ├─ 1775153995771-recording.webm
      ├─ 1780747143376-recording.webm
      ├─ 1780747202834-recording.webm
      └─ listening
         ├─ listening-1774715670235.mp3
         ├─ listening-1774716360628.mp3
         ├─ listening-1774716463844.mp3
         ├─ listening-1774718337176.mp3
         ├─ listening-1774718452678.mp3
         ├─ listening-1774718489936.mp3
         ├─ listening-1774719860267.mp3
         ├─ listening-1774723930791.mp3
         ├─ listening-1774762728613.mp3
         ├─ listening-1774892544392.mp3
         ├─ listening-1774892547839.mp3
         ├─ listening-1774892550055.mp3
         ├─ listening-1774892694222.mp3
         ├─ listening-1774892698341.mp3
         ├─ listening-1774892701011.mp3
         ├─ listening-1774892703573.mp3
         ├─ listening-1774893918807.mp3
         ├─ listening-1774893928792.mp3
         ├─ listening-1774893937812.mp3
         ├─ listening-1774894130416.mp3
         ├─ listening-1774894139528.mp3
         ├─ listening-1774894148045.mp3
         ├─ listening-1774894165103.mp3
         ├─ listening-1775058899393.mp3
         ├─ listening-1775065815390.mp3
         └─ listening-1780747052772.mp3

```