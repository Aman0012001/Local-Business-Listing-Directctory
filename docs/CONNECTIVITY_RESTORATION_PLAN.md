# 🚀 Connectivity Restoration Plan

To restore seamless communication between the Netlify frontend and Railway backend, follow these steps:

## 1. Correct DNS Typos (Completed in Codebase)
The primary issue was a DNS typo (`directory` instead of `directory`) in the production environment variables.

- **Frontend URL Fixed:** `https://local-business-listing-directory-production.up.railway.app`
- **Socket URL Fixed:** `https://local-business-listing-directory-production.up.railway.app`

The following files have been updated in the repository:
- `apps/web/.env.production`
- `backend/.env`
- `backend/src/main.ts`
- `docs/README.md`

## 2. Update Netlify Dashboard (Action Required)
Since I cannot access your Netlify dashboard directly, you must manually update the environment variables to ensure the build uses the correct backend URL.

1. Go to **Netlify Dashboard** -> **Site Settings** -> **Environment variables**.
2. Update the following variables:
   - `NEXT_PUBLIC_API_URL`: `https://local-business-listing-directory-production.up.railway.app/api/v1`
   - `NEXT_PUBLIC_SOCKET_URL`: `https://local-business-listing-directory-production.up.railway.app`
   - `NEXT_PUBLIC_API_BASE_URL`: `https://local-business-listing-directory-production.up.railway.app/api/v1`
3. Save changes.

## 3. Trigger a Redeploy
After updating the variables in Netlify:
1. Go to the **Deploys** tab in Netlify.
2. Select **Trigger deploy** -> **Clear cache and deploy site**.
3. This will ensure the new environment variables are baked into the Next.js build.

## 4. Verify Connectivity
Once the deployment is finished:
1. Visit the live site: `https://endearing-taffy-91a2c6.netlify.app/`
2. Open the **Browser Console** (F12) and check the **Network** tab.
3. You should see successful `200 OK` responses from the `/api/v1/categories/popular` and other endpoints.
4. Confirm that the Socket.io connection is established (no more `ERR_NAME_NOT_RESOLVED` for the socket URL).

---
**Status:** Codebase fixes applied. Pending dashboard update and redeploy.
