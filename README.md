# Before You Get Started

As with most documentation, sadly, the nuxt docs are not great, but they can be useful. So before starting a nuxt project I encourage you to check them out at [Nuxt.js docs](https://nuxtjs.org).

# TODO:

Update Setting up a new project.

Adding Colors
How to add dropdowns with Router
adding a custom component

Gotchas - every page needs a hero or page needs to follow accessibility page

Not built - multi location component, multi item slider, blog pages, topbar

# Setting Up a New Project

The most important thing when setting up a new site is to confirm that the client does or does not have an existing site and that we are in control of the DNS.

If the client does have an exisiting site and you need to move DNS records make sure that you copy over ALL the DNS records before changing the nameservers.

### Plesk

Once the DNS is squared away, start this project by setting up a subscription / domain in the current server you're using to host the template sites. **DON'T ADD AN SSL at this point!**

In Plesk, in the dark grey sidebar, click `Domains` and then `Add Domain`. (*Don't worry if the domain is already hosted on another server - we're adding a domain here just so we can add a subdomain. It'll all make sense in a minute, trust me*).

Once the domain is created find the `File Manager` directory by clicking on the domain name in the list of domains. Once you have the file manager open, clear out the files in `httpdocs`.

![image](https://user-images.githubusercontent.com/29209916/132930771-270cd7a7-4ccf-4fe8-a37f-08e65167f99d.png)

After that's done on you should see a light blue side bar with a directory titled, `Home Directory`. Click that link to access the root directory of the domain. If you're in the right place, you should see three files listed: `error_docs`, `httpdocs` and `logs`.

Add an additional directory here named `.aws` by clicking on the **New** dropdown button and clicking `Create Directory`. Navigate into that new directory and click the **New** dropdown button again but this time we're going to click `Create File`. The file has to be called  `credentials`. Once it's created we're going to paste in our AWS credentials. The AWS access key and secret you need to paste in this can be found in the 'credentials' file in any other nuxt project in the same '.aws' folder. Once you have the file open, you'll want to copy everything - it'll look something like this:

```
[default]
aws_access_key_id = [SECRET_STUFF]
aws_secret_access_key = [moreSecREtStuff]
```
> This is part of the AWS SDK so we can always run code pipeline.

After the credentials file and its contents have been added we can finally make our subdomain. Navigate back to the list of Websites & Domains by clicking on `Domains` in the dark grey sidebar.

Create a subdomain by clicking the `Add Subdomain` button. The subdomain name should be api.[DOMAIN_URL].com. **Again don't add an SSL at this point!**

Once the subdomain is created, we'll create a database as well. Click on your new subdomain in the domains list and then click the `databases` button. Click `Add Database` and fill in the info. This is the same process as our old build and should follow the same naming conventions.

Once that's done leave Plesk open - we'll come back to it later.

### DNS

> Most DNS zone files for our clients are listed on Media Temple. In the next step you'll have to update the DNS records wherever they're located. For this documentation we'll assume it's Media Temple.

Go to Media Temple search for the name of your website and click the domain. It will then open up a new screen where you can find the DNS zone file.

> NOTE: Make sure you LOWER the ttl by clicking the "Lower TTL" button underneath the DNS records.

Once you're there we're going to add a row as an 'A' record. Click 'A' from the dropdown under `Type`. In the `name` field the value is 'api' and in the `Data` field the value is the IP address of whichever server you're using.

![image](https://user-images.githubusercontent.com/29209916/132930376-d7ba9b9f-29e9-4495-b1ce-e9ce16c00855.png)

Now we can add an SSL! Head back to Plesk and add an SSL **ONLY TO THE API SUBDOMAIN**, do not add one to the main domain yet.

![image](https://user-images.githubusercontent.com/29209916/132930323-d7223116-42c2-4634-92dc-5d69e1faec7c.png)

Now head to the ~super reliable and awesome~ BlogVault to migrate your template's backend to your newly created api subdomain. Make sure you've saved all the ftp and database info when you created the subdomain and have it handy.

You should have your api now, we can move on to the next step but keep the Media Temple (or the wherever the DNS zone file is located) window open because you'll need it a few more times.

### Github Template

All the new custom templates like this one are located in GitHub - you can find the all by searching for 'rg-custom-template'.

Create a new repo for your project by clicking the green `Use this template` button in the rg-nuxt repo. Our naming conventions have not changed so the new project should named the same as [DOMAIN_URL]. For Example mesorestaurant for https://mesorestaurant.com or arbitmanortho for https://arbitmanortho.com.

After it's created, clone it down. Don't worry about opening or installing anything yet, there is a lot more stuff to set up first.

### S3 buckets
The static files that we generate for the site will be stored in an s3 bucket and served using cloudfront. So we'll need to set both of those up first.

Assets for the site and the generated html files can be served from a single bucket. Login to AWS and navigate to S3. Hit the orange button `Create Bucket` at name your new bucket the domain url minus the ".com" (i.e. grahamortho for grahamortho.com). For the region choose US West (N. California) and then uncheck "Block *all* public access" (make sure you acknowledge the site could be public ) and then click `Create Bucket`.

![image](https://user-images.githubusercontent.com/29209916/132930923-b2bca579-a63f-45c6-bb69-09d3859d2ab5.png)

Navigate to the new bucket you have just created and select the `Permissions` tab at the top of the page. Navigate to the `Bucket Policy` tab.

If there is nothing there click edit on the bucket policy.

![image](https://user-images.githubusercontent.com/29209916/132930981-9b2d8476-37d5-4647-9ac3-22e9e6d298e5.png)

```javascript

Make sure to swap out the "Resource" with the correct bucket name here -> "Resource": "arn:aws:s3:::[DOMAIN_URL]/*",

{
    "Id": "Policy1573161985594",
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "Stmt1573161981224",
            "Action": [
                "s3:GetObject"
            ],
            "Effect": "Allow",
            "Resource": "arn:aws:s3:::[DOMAIN_URL]/*",
            "Principal": "*"
        }
    ]
}
```

![image](https://user-images.githubusercontent.com/29209916/132930907-5ef81a35-9f10-4f57-a409-df43a7bb2790.png)


## SSL/ACM

We're going to set up a subdomain where the live site will live. For it to work properly it's going to need an ssl certificate and be secure. As great as it was to check the LetsEncrypt button in plesk, that will no longer work for this step. We're going to have to request a certificate manually.

Navigate to the ACM (AWS Certificate Manager) IN US-EAST-1 (n. virginia) *MUST BE IN THIS LOCATION*. https://console.aws.amazon.com/acm/home?region=us-east-1#/ This can be found by going to AWS home and searching for `Certificate Manager` and the region can be found on the top right of the navigation.

Click the `Request a certificate` button. Now request a public certificate. Enter the domains to be protected: `*.[DOMAIN_URL].com` and `[DOMAIN_URL].com` (Use the Add another name to this certificate button to add more domain names).

Click 'Next', click the `DNS validation` method, and continue to Step 5: Validation.

![image](https://user-images.githubusercontent.com/29209916/132931061-c6d84dba-40a9-4dd1-a2ea-8ba7be3d9f52.png)

Under `Domain` you will see your Domain names listed. Click the drop down and you will see the cname records to add to the DNS Record (find your domain, click this and go to edit zone).

![image](https://user-images.githubusercontent.com/29209916/132931144-5bd6183f-9e58-4883-8e68-c72ac3a257fb.png)

We'll need to add these CNAME(s) to the DNS zone file. The Name side of the record the value will look like ```\_370d2a47ac3763ecc382771df7065ec5.[DOMAIN_URL].com```. If you're adding the CNAME in Media Temple, media temple already adds the url so the "name" field should be trimmed to just ```\_370d2a47ac3763ecc382771df7065ec5```.

The Value can just be copy and pasted to the Data field.

Keep mediatemple open again. Go back to AWS and wait for the `Validation status` to be approved this could take up to 5 minutes (you may have to refresh the screen and go back to the `Certificate Manager`). After AWS verifies that we own the dns it will automatically approve the ssl. Then navigate to Lambda in the AWS Console:

## Lambda

Ensure your locale (upper right hand of the browser) is in N. Virginia (us-east-1) and then open the nuxt-url-completion lambda.

Under the navigation bar on the right-hand side of the screen there are several buttons with dropdowns. Find the button labeled `Qualifiers`, open the drop down and select 'versions'. The first choice will be called '$LATEST' - **DON'T CLICK THIS!** Click the first version that's directly below $LATEST.

When the correct version is selected, in the top right of the screen, copy the ARN by clicking the copy button to the right of it. Save that info for the next part.

![image](https://user-images.githubusercontent.com/29209916/132931172-b4c052d8-3e25-46e0-87bd-3862fc6bc092.png)


## Cloudfront

Now that we have certificate for our dev site domain and we have the correct "arn" for the lambda function we're going to use to serve the site we can set up our distributions.

Navigate to Cloudfront in the AWS console. Click `Create Distribution` and start creating your first distribution, for the first distribution you will need to do a toggle a couple settings:

1. select your s3 bucket in origin Domain name
2. set the `Origin Path` to '/dist'
3. toggle `Redirect HTTP to HTTPS`
4. under "Cache key and origin requests", "Cache Policy" should be set to `CachingOptimized` and "Origin request policy" should be set to `CORS-S3Origin`
5. In Lambda function associations select the event type `Origin Request`, the function type is `Lambda@Edge`
6. Paste in the ARN you copied of the lambda e.g. arn:aws:lambda:us-east-1:242372048894:function:nuxt-url-completion:8
7. Under `Distribution Settings` add an alternate Domain Name of 'dev.[DOMAIN_URL].com'
8. click the radio to add a custom ssl certificate
9. select your dev.[DOMAIN_URL] ssl from the list of ssl's (if the certificate is not listed in the dropdown, open the Certificate Manager in a new tab and copy the ARN number and paste it in the input)
10. click create distribution

Create a second distribution now, following the same steps except:

2. set the `Origin Path` to '/assets'
Don't do steps 5 - 10.

After you've created both distributions you'll need the domain for the dev site for the next step.

Go back to the DNS record in mediatemple and add the new CNAME redirect to the distributions.
e.g. Name = dev; Value = [SOME_HASH].cloudfront.net (some hash being the original Cloudfront Domain name).

## github/local

We're almost there. Now, if you haven't already, you can install your dependencies.

``` bash
# install dependencies
my-repo (master!?)$ npm install

# serve with hot reload at localhost:8080
my-repo (master!?)$ npm start
```

The first thing you should do is update the api to the new api.[DOMAIN_URL].com you just created.

![image](https://user-images.githubusercontent.com/29209916/132930280-bb86f423-d1d4-4fd1-af3a-95276f1ddcfc.png)

You should also update the contact form's "from" and "to" addresses.  The "from" address should be: no-reply@[DOMAIN_URL].com . Now push that code up and head back to AWS to set up the best part of this build!

## Codepipeline
One of the joys of the Nuxt static site builds is that we can utilize continuous integration with AWS CodePipline. That means you never have to de-privatize your repos or run builds or push themes  - no more WPusher! Everything will now taken care of automatically, so let's get started.

To create a codepipeline go to the aws console and navigate to codepipeline.

**If you're still in the us-east-1 (Virginia) territory now you have to switch to us-west-1 (N. California) territory.**

From there create a new codepipeline with the orange `Create Pipeline` button.

Step 1 - Name your pipeline as the domain of the site e.g. mesorestaurant per our naming conventions. Create a new service role also named the same as the website. Click `Next`.

Step 2 - *UPDATE 11/05/2020* Source stage. Choose the `GitHub (Version 2)` option in the source provider drop down. Then under "Connection" select the FIRST 'roostergrin' from the dropdown. Select the repositories dropdown, if your repo isn't on the list of possible repositories you can manually add it in. Then select the master branch as the branch. Use GitHub webhooks as the detection option. Click `Next`.

Stage 3 - Add build stage. Select AWS CodeBuild in the build provider drop down, Region should be US West - (N. California), for the project name select roostergrin-nuxt-test (this is just the original name of the building process). Click `Next`.

Step 4 - Add deploy stage. Select Amazon S3 for the Deploy provider, the same region (US West - (N. California)) and select the dist bucket you created in the S3 step, the region should be automatic, Check the 'Extract file before deploy option' and set the deployment path to 'dist'. Click `Next`. Then `Create pipeline`.

## WP Backend

Go to your newly created website WP backend (api.[Domain URL].com/wp-admin). Go into the theme editor, open the functions folder, open the run-build.php, update the codepipeline to the correct one you just created

```
	$result = $client->startPipelineExecution([
		'name' => '[Domain URL]'
	]);
```
if you are getting an error and unable to save these changes, make this change in the backend of the site.

## Launching the site

Update Docs - uncomment the run-build function call in Functions.php
If serving on www subdomain root domain MUST have an ssl
