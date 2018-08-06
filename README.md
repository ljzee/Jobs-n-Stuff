# Jobs n' Stuff
Repository for Group 1 CMPT 470 Summer 2018 project

## Instructions:
1. Navigate to cloned folder
2. `vagrant up`
3. Navigate to `localhost:3000` in your web browser

The database has been seeded with four users.<br />
The following list contains usernames to login as those users.<br />
(The password for each user is **password**).
* Admin User:
  * Username - admin
* Business Users:
 * Username - business
 * Username - cyber
* Base User:
 * Username - testguy

### Usage scenarios

#### Base User
##### Sign up for a personal account
1. Create an account using your email.
2. Use account activation link sent to your email.
3. Fill in your personal information and upload a profile picture.

##### Change your password
4. Select change password from your profile page.
5. Enter in a new password and confirm.
6. Logout and sign in with the new password.

##### Forgot your password
7. Logout of the current user and select 'Forgot your password' from the login screen.
8. Enter your email address.
9. Check your email for a link to reset your password.
10. Create your new password and verify you can log back in with it.

##### Upload documents
11. Select 'Documents' in the navigation bar.
12. Upload a PDF Resume and Coverletter.

##### Job filtering
13. Select 'Job Postings'
14. Expand the posting filters by selecting 'Filters'.
15. Input the desired fields in the filter and select 'Apply Filters'.

##### Job application
16. Select the job title or details button of a job you want to apply to.
17. View the details pertaining to the job.
18. Select 'Apply' and choose the resume and cover letter you have uploaded. <br />
    (If the job requires a cover letter, you will be provided the option to choose one.)
19. Finish the application process by selecting 'Apply' in the pop-up window.
20. Check that your application exists in the 'Applications' page and dashboard.

#### Business User
##### Sign in as existing business user
21. Logout of your personal account
22. Sign into the respective business account you applied for. <br />
    (ACME has username business, Cyberlife has username cyber).

##### Review applications to a posting
23. Review the application you've made by selecting 'View Applications' in <br />
    the respective posting in either the dashboard or manage postings page.
24. Download the resume and or cover letter you uploaded as a user.

##### Create a job posting
25. From the manage postings page, select 'Create New Posting'
26. Fill in the required fields and any optional fields you desire.
27. Save your posting and notice it is in the 'Pending' state.
28. Activate your posting to make it viewable by users.

##### Create a new business user
29. Logout of the current user account
30. Sign up for a new business account
31. Fill in the required fields for your business profile and save.
32. Notice that 'Manage Postings' is not available on your account because it <br />
    has not yet been activated by the admin.

#### Admin User
##### User activation
33. Logout of the business user account
34. Sign in to admin user (Username - admin)
35. Activate your created business account from the dashboard

##### Suspend, Reactivate, or Delete user
36. From the manage users page, deactivate a user to prevent them from viewing <br />
    or creating job postings.
37. You may reactivate this user from the current page or the dashboard.
38. Delete user 'testguy' from the manage users page.