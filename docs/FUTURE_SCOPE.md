# ACPS ResultHub - Future Scope

Nothing here stops the system from being used today. It tells the school and the developer what to do next.

## A. What the school must give

1. **Mark distribution of EVERY class and group**
   - Why: Only Class IX Science came from the school's ERP chart. Other classes use sample numbers.
   - How: Send the ERP 'Mark Distribution Chart - Details' PDF for each class, group and term. The IT Head then edits Mark Blueprint.
   - NB: Check the pass mark of every part (Objective, Subjective, Practical) for both the 45 and the 33 rule.

2. **Meaning of 'M.S' and the ICT formula**
   - Why: The ERP chart has an 'M.S' column and the ICT row (Objective 25 + Practical 25 at 80%) does not add to 50.
   - How: Ask the ERP vendor or the exam office. Then correct Mark Blueprint (ICT row) and Rule Studio if a formula changes.
   - NB: Until answered ICT uses 25 + 25 = 50, multiply by 2.

3. **Subject codes**
   - Why: Civics code was given as 112 which is also Hindu religion. Primary and Class VI-VIII subjects have no Board code.
   - How: Send the correct code list. Update Subject Library (code is the ID).
   - NB: Do not change a code after marks are entered.

4. **Confirm the assumed rules**
   - Why: Class X weights 20/20/25/35, grade C for 45-49, grace 3 marks in 1 subject, merit tie-break Math-English-Bangla, promotion and SSC eligibility rules.
   - How: Management reads the list in Rule Studio and Exam Planner and says yes or gives the new value.
   - NB: All of them can be changed by the IT Head any time.

5. **What each status code does**
   - Why: AB, EX, WH, EXP, TR currently give 0 marks. Is that right for Exempted and Transferred?
   - How: Decide per code. Edit in Status Codes.

6. **Logo, seal and signature pictures**
   - Why: Transcripts show a text signature line only.
   - How: Send clear PNG files of the school seal, Principal and Vice Principal signatures (digital signature is approved).
   - NB: Backend step 'File storage' is needed to keep them safely.

7. **Real lists of teachers, students and classes**
   - Why: The system holds 200 sample students and 8 sample teachers.
   - How: Export from SICS to Excel. IT Head uses Easy Import. Teachers are added in Teacher Desk, then assigned in Teacher Planner.
   - NB: Student ID is permanent. Roll is new each session.

8. **Academic calendar and working days**
   - Why: Attendance needs working days per exam.
   - How: Send the yearly calendar. Class teachers type working days in Attendance Book.

9. **SMS provider**
   - Why: Parent Connect saves messages but cannot send them.
   - How: Choose a Bangladeshi SMS gateway, create an account (API key, sender name) and give it to the developer.
   - NB: Ask for Bangla (Unicode) SMS support.

10. **Where the system will run (cloud)**
   - Why: A server and database are needed so everyone uses the same data.
   - How: Choose a cloud provider and a domain name. Give access to the developer.
   - NB: Daily backup and 5-year audit storage must be on.

11. **Approve the transcript design**
   - Why: Bangla and English versions, A4. Sample layout follows the school's old transcript.
   - How: Print one transcript from Transcript Studio. Principal marks changes. IT Head or developer applies them.

## B. Developer steps (connect the backend)

### 1. Create the database
1. Make one table for each file in public/data (students, teachers, marks, exams ...). The README lists all 37 collections.
2. Keep the 'id' of every record as the primary key.
3. Fields that look like objects (components, rows, custom) can be JSON columns.

**NB:** Do not rename fields - the screens expect these names.

### 2. Connect the screens
1. Open src/Components/services/api.js and dataStore.js.
2. Replace each function (list, get, create, update, remove, replace, upsertMany) with a fetch() to /api/<collection>.
3. Remove the localStorage lines. Nothing else in the project changes.

**NB:** Keep audit(): the server should write the Change Trail itself.

### 3. Real sign-in
1. Add POST /api/login that checks a hashed password and returns a token.
2. Send the token with every request.
3. Check the role and permission on the server for every request (the screen only hides buttons).

**NB:** users.json has demo plain-text passwords. Never ship them.

### 4. Results on the server
1. src/engine is plain JavaScript with no React. Run the same code on Node.
2. Calculate when an exam moves to 'Calculated' and store the result.
3. Publish copies the stored result so published results never change by accident.

**NB:** Run npm run verify:engine after any change.

### 5. File storage
1. Add upload for school seal, signatures, student photos.
2. Store the file link in settings (seal, signatures) and read it in TranscriptView.

### 6. Real SMS
1. Add POST /api/sms/send that calls the provider.
2. In SmsPage replace the api.create('smsLog') call with this endpoint; keep writing to smsLog.

**NB:** Limit sending per user per hour.

### 7. SICS link (optional)
1. Until then use Easy Import with the same column names.
2. Later write a nightly job that reads SICS and upserts students.

**NB:** Student ID is the key.

### 8. Backup and retention
1. Daily database backup.
2. Keep the audit table for 5 years.
3. Test a restore once.

### 9. Phone app feel (optional)
1. The project already has an install file (manifest). Add a service worker for offline marks entry.
2. Users can use 'Add to Home screen' today.

## C. What each feature will do next

- **Exam Journey** - Same screens; the server will keep the status and send alerts (SMS/email) when an exam changes step.
- **Marks Desk** - Marks will save to the server automatically while typing; offline saving can be added.
- **Attendance Book** - Daily attendance from the ANS (Absent Notification) module will fill these numbers automatically.
- **Extra Time** - Teachers will get an SMS or app alert when the answer is ready.
- **Correction Desk** - Approvers will be notified by SMS or email.
- **Grace Desk** - A written approval letter (PDF) can be attached to each grace.
- **Pass Switch** - The approving authority's name and date will be stored with each switch.
- **Result Board** - Results will be calculated and stored on the server when an exam is verified.
- **Transcript Studio** - School seal and signature pictures will be added from Safe Box.
- **Report Shelf** - New reports can be added without changing the other pages.
- **SSC Pathway** - Board result import from the Board's Excel file.
- **Promotion Desk** - Old sessions will stay readable from an archive on the server.
- **Class Explorer** - Timetable and room plans can be added to each section.
- **Student Book** - Photo, documents and family details can be added as new fields from Field Builder.
- **Easy Import** - A direct link to SICS will replace the file step.
- **Subject Picker** - Students or parents will be able to request a choice online.
- **Teacher Desk** - Teacher leave and substitute teacher can be added.
- **Teacher Planner** - Yearly plan copy: copy last year's plan to the new session in one tap.
- **Access Keys** - Passwords will be stored safely on the server and sign-in can use SMS codes.
- **Mark Blueprint** - Version history: see who changed a blueprint and restore an older one.
- **Exam Planner** - Exam routine and seat plan can attach to each exam.
- **Subject Map** - Elective subject limits per group.
- **Subject Library** - Bangla names and Board syllabus links.
- **Grade Book** - Different tables for primary and secondary if the school needs them.
- **School Lists** - Campus (branch) specific lists.
- **Status Codes** - Auto-fill from the Absent Notification module.
- **Rule Studio** - Rule history with 'who changed what' and one-tap restore.
- **Name Studio** - Full Bangla language pack.
- **Field Builder** - Fields for Parents and Sections.
- **Parent Connect** - Connect an SMS provider to really send. See Future Plan.
- **Help Desk** - Photo attachment and WhatsApp alert.
- **Change Trail** - Stored on the server with yearly archive.
- **Safe Box** - Cloud backup every night.
- **How-To Guide** - Video guides.
- **My Results** - Result notification by SMS.
- **Call School** - Message the class teacher inside the app.

## D. Later ideas

- **Parent app and WhatsApp alerts** - Result and attendance alerts to parents.
- **Smart insights** - Weak subjects per class, improvement over exams, early warning for failing students.
- **ERP modules** - ANS (absence alerts) fills attendance. LMS and HRM can share the same students and teachers.
- **Online admission and fee link** - New students flow straight into Student Book.
- **Teacher leave and substitutes** - Move a teacher's batches to a substitute for a few days.
