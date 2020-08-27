# Open Trail View Uploader

## In one sentence

Command line Python script that 1) takes a directory of geotagged 360 images, 2) validates they contain correct 360 metadata, and 3) uploads and publishes them to a Open Trail View accounts.

## Why we built this

We support the ethos and direection of [Open Trail View](https://www.opentrailview.org/). 

[OpenTrailView is a web app that hosts panoramic images of hiking trails. It is similar to Goole Street view in functionality](https://opentrailview.org). [OTV is an open-source app](https://gitlab.com/nickw1/opentrailview).

For a long time Open Trail View only supported single photo uploads, which meant uploading thousands of images from each tour we shot would be too time consiming.

[Originally we used Tourer](https://github.com/trek-view/tourer), and single upload tool, although it became a bit of a complex with the inclusion of unique upload workflows.

Open Trail View Uploader is a simple, 'does what it says on the repo' command line script that can be used to upload photos to [Open Trail View](https://www.opentrailview.org/).

## How it works

### Overview

1. You use [Sequence Maker](https://github.com/trek-view/sequence-maker) to create photo connections
2. You define the panoramic photos to upload
3. The script validates that they meet the minimum Open Trail View criteria
4. You define the Open Trail View authentication data
5. The script uploads the images toOpen Trail View
6. Open Trail View publishes your images within 72 hours

### The details

The script first defines the order for upload using [Sequence Maker](https://github.com/trek-view/sequence-maker) in the photo. If no Sequence Maker information exsits, they will be required to first run Sequence Maker on the photos.

The script will then upload photo to the authenticated account.

The script uses OAuth2 (set up by user) to communicate with the OTV app.

The OAuth2 URLs are as follows:

* Authorise - https://opentrailview.org/oauth/auth/authorize
* Access token - https://opentrailview.org/oauth/auth/access_token

[The OpenTrailView API docs can be found here](https://opentrailview.org/addApp).

This API accepts panoramic Photos to be published on OpenTrailView.

Uploading panoramas is simple using the Upload API endpoint

```
POST https://opentrailview.org/oauth/api/panorama/upload
```

The upload API takes one POST parameter, 'file', containing the file to be uploaded. Max size = 30MB.

**Responses**

It will return 200, or 400, 401 or 500 depending on the circumstance, together with some JSON describing the success (and panorama ID) or otherwise of the upload.

User will be shown appropriate success or error message for each photo.

The script will upload all photos, and will retry 3 times for failures. It will also generate a tmp file that keeps tracks uploads (and returned photoids). This is placed in the input folder and will remain after scrip completes (or fails). This means you can look into this to find photoids in the future (if you need to check publish status) or restart the script from where it left off in case of failures (the script will check for this file in specified directory prior to execution).

## Requirements

### OS Requirements

Works on Windows, Linux and MacOS.

### Software Requirements

* Python version 3.6+

### Image / Video requirements

The script performs a number of checks before creating a tour to ensure all your panoramas meet specific requirements Open Trail View.

* [Sequence Maker](https://github.com/trek-view/sequence-maker) data must be present.
* Photo Sphere XMP metadata must be included in the photo medadata. (The Exif XMP tag, "ProjectionType=equirectangular")
* Photos must not exceed a resolution of 75 megapixels.
* Photos must not exceed a filesize of 30mb.
* Supported file types
	- `.jpg`
	- `.jpeg`
	- `.tif` 
	- `.tiff`

### Installation

### 1. Register a new OTV app

![OTV create new app screen shot](/readme-images/opentrailview-add-app.png)

Login to OTV, [and register a new app](https://opentrailview.org/addApp).

![OTV app credentials screen shot](/readme-images/opentrailview-app-credentials.png)

Once registered you will get a key and secret to use.

### 2. Enter you API keys into the config file

Copy the OTV client ID and client secret values generated during step 1 into the [config.ini](/config.ini) file.

```
$ vi config.ini
```

```
[otvauth]
client_id = YOUR_CLIENT_ID_HERE
client_secret = YOUR_CLIENT_SECRET_HERE
credentials_file = creds/otv_creds.data
```

### 3. Authenticate your OTV account

You must authenticate with OTV using the OTV account you want to use to use to upload to OTV using (shown as the owner of the photos in the OTV).

You will be promoted to do this when creating your first OTV upload.

When you do this you will need to authenticate your OTV account by following the instructions.

```
Open Trail View: Use this link to get the code: https://opentrailview.org/oauth/auth/authorize?response_type=code&client_id=ID
```

A URL will be shown that you must copy and open in a browser. You will then be prompted to allow your application to use your OTV account.

![OTV app grant permissions](/readme-images/opentrailview-app-grant-permissions.png)

You'll be prompted to allow the script to access to your OTV account. Select all the options to allow the script to function properly.

```
The encrypted authorization code is XXXX
```

Then enter the code shown in the command line.

```
Enter URL code: 
```

If unsuccessful you'll see the message:

```
Authentication has failed: invalid_grantMalformed auth code.
```

Everytime you upload to Open Trail View, you will also need to agree to Open Trail View's Terms of Service or the upload will be aborted:

```
Do you agree to Open Trail View’s Terms of Service? https://opentrailview.org/ [y/N]:
```

If you do not agree, the upload to OTV will be aborted.

## Quick start guide

### Format

```
python otv.py [INPUT PHOTO DIRECTORY]
```

## FAQ

**How long does it take for footage to be posted publically on Open Trail View**

After your footage has been sent to Open Trail View for processing, the photos will be reviewed for prohibited content. It can take up to 72 hours for them to be published.

## Support 

We offer community support for all our software on our Campfire forum. [Ask a question or make a suggestion here](https://campfire.trekview.org/c/support/8).

## License

Open Trail View Uploader is licensed under a [GNU AGPLv3 License](/LICENSE.txt).
