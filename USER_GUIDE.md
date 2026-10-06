# User Guide: Lost & Found Management System

This guide explains how to use the Lost & Found Management System as a regular community member or an authorized administrator.

---

## 1. Reporting a Lost Item
1. Click **"Report Lost"** in the top navigation or select **"I Lost Something"** from the home page.
2. Fill in the required fields:
   - **Item Title**: e.g., "Navy Blue Apple iPhone 13 in Clear Case"
   - **Category**: Select the closest category (e.g., *Electronics*).
   - **Date Lost**: Select the approximate date you lost the item.
   - **Approximate Location**: e.g., "Library 2nd Floor Study Desk".
   - **Description**: Provide visual details without listing secret identifying codes.
3. *(Optional)* Attach a photo and your contact information.
4. Click **"Submit Lost Item"**.
5. The system will save your report and immediately display any **Suggested Matches** found by the rule-based matching engine.

---

## 2. Reporting a Found Item
1. Click **"Report Found"** in the top navigation or select **"I Found Something"** from the home page.
2. Enter the item details, including the location found and date found.
3. Click **"Submit Found Item"** to list it in the public repository so the owner can search for it.

---

## 3. Searching for Items
1. Click **"Search Items"** in the navigation bar.
2. Use the filter controls:
   - **Type Tabs**: Switch between *All Items*, *Lost Items*, or *Found Items*.
   - **Search Bar**: Search by item title or description keywords.
   - **Category Dropdown**: Narrow by category (e.g., *Wallets & Bags*, *Keys & Badges*).
   - **Location**: Filter by specific buildings or areas.
   - **Status**: Filter by *Open* or *Claimed/Returned*.
3. Click on any item card to open the **Item Details** page.

---

## 4. Submitting an Ownership Claim
1. Open the item details page of the found item you believe is yours.
2. Click **"Claim This Item"**.
3. In the claim form, provide:
   - Your full name and contact email.
   - **Proof of Ownership / Distinguishing Marks**: Describe details that only the true owner would know (e.g., "There is a state driver license in the left slot with name Jane Doe", "The phone has a small scratch next to the charging port and the wallpaper is a golden retriever").
4. Click **"Submit Claim"**.
5. **Important**: Copy your **Claim Tracking Code** (e.g., `CLM-9021A4`) from the confirmation screen.

---

## 5. Tracking Your Claim Status
1. Click **"Track Claim"** in the navigation bar.
2. Enter your Claim Tracking Code (e.g., `CLM-9021A4`) and click **"Track Claim"**.
3. View the live status:
   - **Pending**: Claim received and waiting for reviewer evaluation.
   - **Under Review**: Reviewer is currently checking details.
   - **Approved**: Verification successful. Check the Reviewer Resolution Note for collection instructions.
   - **Rejected**: Claim could not be verified against the item.
4. Review the timeline at the bottom to see status transition history and reviewer notes.

---

## 6. Administrator / Reviewer Workflow
1. Click **"Admin Portal"** in the navigation bar.
2. Sign in with administrator credentials (default demo: `admin@lostfound.local` / `admin123`).
3. **Claims Review Queue**:
   - Filter by claim status (e.g. *Pending*).
   - Click **"Review"** on any claim row.
   - Inspect the claimant's submitted proof details against the item information.
   - Enter a **Reviewer Resolution Note** (e.g., "Verified serial number with claimant; item handed over").
   - Click **"Approve Claim"**, **"Mark Under Review"**, or **"Reject Claim"**.
   - Approving a claim automatically updates the item status to `claimed`.
4. **Item Catalog Management**:
   - Change item statuses directly (`open`, `claimed`, `returned`, `closed`).
   - Remove duplicate or spam items using the delete action.
