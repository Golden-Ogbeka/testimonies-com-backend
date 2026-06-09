# feat(profile): Profile editing, photo upload, settings modals, and UX improvements

## Summary
Extensive profile feature work in the React Native mobile app: new edit profile photo screen, complete edit profile refactor with Zod validation for both user and organization types, three new reusable modal components, and a full settings screen overhaul. Auth validation schemas and API types also expanded. 18 files changed, ~1300 insertions, ~150 deletions.

---

## 🖼️ Profile Photo & Cover Photo Editing
**Files:** `src/features/profile/screens/EditProfilePhotoScreen.tsx`, `src/features/profile/screens/OwnProfileScreen.tsx`, `src/features/profile/api.ts`

- **New `EditProfilePhotoScreen`** — full-screen React Native image picker flow:
  - Uses `react-native-image-picker` (`launchImageLibrary`) for photo selection.
  - Displays concurrent current-preview and selected-preview images with circular (avatar) vs rectangular (cover) containers.
  - Uploads via `FormData` to `profileApi.updateProfilePicture()` or `profileApi.updateCoverPhoto()` scoped by a `type: 'avatar' | 'cover'` route param.
  - React Query cache invalidation on success — `queryKeys.myProfile()` — so the profile screen refreshes immediately.
- **Own profile cover/avatar on-edit navigation** now routes to `EditProfilePhoto` instead of `EditProfile`, passing `type: 'cover' | 'avatar'`.
  - Avatar URI resolves to `businessLogoURL` for org accounts or `profileImage` for users.

---

## ✏️ Edit Profile — Full Refactor with Validation
**Files:** `src/features/profile/screens/EditProfileScreen.tsx`, `src/features/profile/types/index.ts`, `src/features/profile/api.ts`, `src/common/validation/profileSchemas.ts`

### EditProfileScreen
- Replaced inline state (`useState`) and manual mutation with `react-hook-form` + `@hookform/resolvers/zod` for type-safe, validated forms.
- **`UserForm`** — for personal accounts: edits `firstName`, `lastName`, `bio`, and new `address` field.
- **`OrgForm`** — for organization accounts: edits `businessName`, `businessBio`, `businessAddress`, and `businessWebsite` (with URL keyboard and `z.string().url()` validation).
- Profile detection: `profile?.accountType === 'organization'` picks the right form.
- Form errors surfaced inline via `error={errors.fieldName?.message}` on each `AppTextInput`.
- `disabled={!isValid}` on Save button prevents submission until all fields pass Zod validation.

### Profile Types (`src/features/profile/types/index.ts`)
- Added `OrganizationProfile` type extending `UserProfile` with org-specific fields: `businessEmail`, `businessPhoneNumber`, `businessLogoURL`, `businessAddress`, `businessWebsite`, `businessBio`, `active`, `kycCompleted`, `isFlagged`, account timestamps, etc.
- Added `CreateOrgProfilePayload`, `UpdateOrgProfilePayload`, `UpdateUserProfilePayload`, and unified `UpdateProfilePayload = CreateOrgProfilePayload | UpdateOrgProfilePayload`.

### Zod Validation (`src/common/validation/profileSchemas.ts`)
- New `editUserProfileSchema`: `firstName` (min 1, max 100), `lastName` (min 1, max 100), `bio` (max 300), `address` (max 200).
- New `editOrgProfileSchema`: `businessName` (min 2, max 200), `businessBio` (max 300), `businessAddress` (max 200), `businessWebsite` (max 200, URL or empty string).
- Exported `EditUserProfileFormValues` / `EditOrgProfileFormValues` via `z.infer`.

### Profile API (`src/features/profile/api.ts`)
- `getMyProfile` return type updated to `UserProfile | OrganizationProfile`.
- New `updateOrgProfile(payload)` → `PATCH /profile/org` endpoint.
- Separate `updateProfile(payload)` → `PATCH /profile/user` (personal) and `updateOrgProfile` (org).

---

## 🧩 New Reusable UI Components
**Files:** `src/common/components/AppModal.tsx`, `src/common/components/AppTextInput.tsx`, `src/common/components/PrimaryButton.tsx`

### AppModal
- New flexible bottom-sheet-style modal with `variant: 'full' | 'center'`.
- `'full'` — full-screen page sheet on iOS, slide animation, embeds `react-native-toast-message`.
- `'center'` — centered dialog with overlay backdrop, close button (X icon), title bar, and scrollable content.
- Used by `SettingsScreen`, `ChangePasswordModal`, `SignOutModal`, and `UpdateVisibilityModal`.

### AppTextInput
- New `multiline` prop dynamically switches between `min-h-14` (single line) and `py-3` (multi-line), and sets `textAlignVertical: 'top'` for multiline.
- `Error` display via `error={string}` prop on the container.

### PrimaryButton
- Fixed `className` transformation: `className` prop is now always appended (including default value) instead of conditionally stripped, preventing the common Tailwind bug where `className` was dropped entirely when provided. Structure is now:
  ```
  flex-row items-center justify-center rounded-lg px-8 py-4 [variantColors]
  [opacity-50] [userClassName]
  ```

---

## ⚙️ Settings Screen Overhaul
**Files:** `src/features/settings/screens/SettingsScreen.tsx`, `src/features/settings/components/ChangePasswordModal.tsx`, `src/features/settings/components/SignOutModal.tsx`, `src/features/settings/components/UpdateVisibilityModal.tsx`, `src/common/utils/toast.tsx`, `src/common/validation/authSchemas.ts` (existing)

- Inline `Modal` and `react-hook-form` logic moved from `SettingsScreen` into dedicated component files for better separation of concerns.

### ChangePasswordModal
- Reintegrated from `SettingsScreen` into its own component.
- Uses `useForm` with `zodResolver(changePasswordSchema)`, `mode: 'onTouched'`.
- Fields: `oldPassword`, `newPassword`, `confirmNewPassword` (all `secureTextEntry`).
- Calls `useChangePassword()` mutation; on success => closes modal, resets form, shows toast.

### SignOutModal
- New centered `AppModal` variant.
- Two-button layout: Cancel (secondary) + Sign Out (primary with loading state).
- Replaces deprecated `Alert.alert` confirm dialog.

### UpdateVisibilityModal
- Three options: Public, Private, Secret — each with description text and radio-selection indicator.
- Cancel / Save button row; Save disabled if value hasn't changed (`selected === selectedValue`).
- Calls `useUpdateVisibility()` with `onSuccess` toast and auto-close.

### SettingsScreen logic
- `cycleVisibility` username (`next` enum) replaced with `handleSelectVisibility` that opens the visibility picker modal and saves via API on Confirm.
- `'Manage Sessions'` and `'Subscription'` rows commented out pending future work.
- `handleSignOut` now opens `SignOutModal` instead of `Alert.alert`.

---

## 🗺️ Navigation
**Files:** `src/app/navigation/types.ts`, `src/app/navigation/index.tsx` (MainStack), `src/routes/profile.ts`

- Added `EditProfilePhoto: { type: 'avatar' | 'cover' }` to `MainStackParamList`.
- Registered `<Stack.Screen name={EDIT_PROFILE_PHOTO} component={EditProfilePhotoScreen} />` in the main navigator.

---

## 🥞 Toast — Close Button
**File:** `src/common/utils/toast.tsx`

- Added a close (`X`) button to each toast item using `react-native-toast-message` `onPress = () => Toast.hide()`.
- Requires `<ToastLib config={toastConfig} />` to be placed inside `AppModal` (already done per `AppModal` full variant).

---

## Key Dependencies Context
- `react-hook-form`, `zod`, `@hookform/resolvers/zod` — form management and validation
- `react-native-image-picker` — photo gallery selection
- `lucide-react-native` — icons for modal close buttons, settings icons, check marks
- `@tanstack/react-query` — cache invalidation after profile mutations
