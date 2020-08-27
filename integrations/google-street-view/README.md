# Google Street View Uploader

## In one sentence

Command line Python script that 1) takes a directory of geotagged 360 images, 2) validates they contain correct 360 metadata, 3) reverse geocodes (to get Google placeid), and 4) uploads and publishes them to a Google accounts.

## Why we built this

We uploads millions of images to Google Street View every year. There are some paid tools that charge by number of uploads (which would be too expensive for us) and other products offered in the form of smartphone apps (which are 1) very tedious to upload a large number of photos, and 2) do not exists for GoPro products -- [what we use for our Trek Pack](https://www.trekview.org/trek-pack/)).

[Originally we used Tourer](https://github.com/trek-view/tourer), and single upload tool, although it became a bit of a complex with the inclusion of unique upload workflows.

Google Street View Uploader is a simple, 'does what it says on the repo' command line script that can be used to upload and connect photos (as a blue line) in Google Street View.

## How it works

### Overview

1. You use [Sequence Maker](https://github.com/trek-view/sequence-maker) to create photo connections
2. You define the panoramic photos to upload
3. The script validates that they meet the minimum Google Street View criteria
4. (Optional) The script uses the Google reverse geocode API to find nearby place values using the first image in sequence, asks user to choose on, and then assigns selected Place information to all images.
5. You define the Google authentication data
6. The script uploads the images to Street View
7. THe script updates the images uploaded to Google Street View with connection information (to create blue line)
8. Google Street View publishes your images within 72 hours

### The details

The script first defines the order of connections (if user wants to connect photos). The script identifies connections injected by [Sequence Maker](https://github.com/trek-view/sequence-maker). If no connection information exists but user wants connections, they will be required to first run Sequence Maker on the photos.

Once connections are made, the script then attempts to assign a [Google Maps place ID](https://developers.google.com/places/place-id). This information can be obtained through the [Google Geocoding API](https://console.cloud.google.com/google/maps-apis/apis/geocoding-backend.googleapis.com) to lookup address info and place information against each photo.

The Geocoding API returns a range of places (from address to state level). Users will be prompted to select the correct location for the series of photos they are uploading. The first photo in the sequence will be used to perform the place lookup, all photos in the sequence will inherit the same place (meaning only one lookup will ever be performed to reduce API usage costs).

[The Street View Publish API photo.place resource takes the place metadata chosen](https://developers.google.com/streetview/publish/reference/rest/v1/photo#place).

**A note on Google Local Guides**

You can earn points by contributing content to Google Maps by becoming a [Local Guide](https://support.google.com/local-guides/answer/6225846?hl=en-GB&ref_topic=6225845).

Every place that you review, photograph, add, edit or provide additional info for on Google Maps [earns you points towards unlocking something new](https://support.google.com/local-guides/answer/6225851?hl=en-GB).

[Each published GSV photo upload earns 5 points](https://support.google.com/local-guides/answer/6225851?hl=en-GB).

To score points, [register the Google Account you will be uploading GSV to as a Local Guide here](https://maps.google.com/localguides).

You must also enable PlaceId lookup using Geocoding API so that placeid can be submitted with the photo uploaded to score Local Guides points when using this script.

[More on PlaceId's here](https://www.trekview.org/blog/2019/place-id-google-street-view/).

**End of note**

This script uses the [Street View Publish API](https://developers.google.com/streetview/publish) to publish panoramic photos to Google Street View.

[We've written an introduction to the Street View Publish API here](https://www.trekview.org/blog/2020/street-view-publish-api-quick-start-guide/). It is a useful guide in quickly understanding the fields that can be utilised with the API.

[The photo.pose resource takes the following values](https://developers.google.com/streetview/publish/reference/rest/v1/photo#pose). The corresponding Sequence Maker value is shown:

* "captureTime" (required) > original_GPSDateTime
* "latitude" (required) > original_latitude
* "longitude" (required) > original_longitude
* "altitude" (required) > original_altitude
* "heading" (optional) > original_heading, else connection.heading_deg (for connection with positive connection.distance_mtrs)
* "pitch" (optional) > original_pitch, else connection.pitch_deg (for connection with positive connection.distance_mtrs)
* "roll" (optional) > original_roll, else ""
* "connections" (optional) > photos.connections. (either 1 value for start and end of sequence else 2 values)

The script performs the upload process in two steps:

1. [Creates a photo on Google Street View, uploads the raw photo data to Google Servers](https://developers.google.com/streetview/publish/reference/rest/v1/photo/create), and stores the `photoId` of each photo successfully uploaded
2. [Takes the returned `photoId` generated and updates the Google photo record with connection information calculated earlier by the script](https://developers.google.com/streetview/publish/reference/rest/v1/photo/update).

The script will upload all photos, and will retry 3 times for failures. It will also generate a tmp file that keeps tracks uploads (and returned photoids). This is placed in the input folder and will remain after scrip completes (or fails). This means you can look into this to find photoids in the future (if you need to check publish status) or restart the script from where it left off in case of failures (the script will check for this file in specified directory prior to execution).

**A note on Connections / Blue Lines**

It’s important to note, Google does some server side processing of Street View images too.

[Google recommends when taking 360 Street View images](https://support.google.com/maps/answer/7012050?hl=en&ref_topic=627560).

> Space the photos about two small steps apart (1 m / 3 ft) when indoors and five steps apart (3 m / 10 ft) when outdoors.

This video from the Street View Conference in 2017 also [references the 3m interval](https://www.youtube.com/watch?v=EW8YKwuFGkc).

[According to this Stack Overflow answer](https://stackoverflow.com/questions/54237231/how-to-create-a-path-on-street-view):

> You need to have > 50 panoramas with a distance < 5m between two connected panoramas. After some days (weeks?) Google will convert them to a blue line in a separate processing step.

It’s safe to assume in some cases Google servers might automatically connect your images into a blue line even if a connection target is not defined, [as addressed here](https://support.google.com/contributionpolicy/answer/7411351):

>  When multiple 360 photos are published to one area, connections between them may be automatically generated. Whether your connections were created manually or automatically, we may adjust, remove, or create new connections — and adjust the position and orientation of your 360 photos — to ensure a realistic, connected viewing experience

In summary, you're photos can be connected to other photos on the Street View platforms, in addition to the connections defined in the script.

**End of note**

## Requirements

### OS Requirements

Works on Windows, Linux and MacOS.

### Software Requirements

* Python version 3.6+

### Image / Video requirements

The script performs a number of checks before creating a tour to ensure all your panoramas meet specific requirements for [the Google Street View Publish API](https://developers.google.com/streetview/publish/limits).

* [Sequence Maker](https://github.com/trek-view/sequence-maker) data must be present.
* [Photo Sphere XMP metadata must be included in the photo medadata](https://developers.google.com/streetview/spherical-metadata). (The Exif XMP tag, "ProjectionType=equirectangular")
* [Photos must have a resolution of 7.5MP (4K) with a 2:1 aspect ratio](https://support.google.com/maps/answer/7012050?hl=en&ref_topic=627560).
* [Photos must not exceed a resolution of 100 megapixels](https://developers.google.com/streetview/publish/limits).
* [Photos must not exceed a filesize of 75MB](https://developers.google.com/streetview/publish/limits).
* Supported file types
	- `.jpg`
	- `.jpeg`
	- `.tif` 
	- `.tiff`
* Superimposed content must be limited to either the zenith or nadir (top or bottom 25% of the equirectangular image), but can't be present in both.
* If you’re appending any form of attribution (watermark, authorship information, etc.) to the zenith or nadir of your 360 photo, [please note the relevant requirements](https://www.google.co.uk/streetview/sales/).
* 360 photos must wrap 360 without any gaps in the horizon imagery. These images don't have to extend to the zenith and nadir (top to bottom), but between the top and bottom edges of your 360  photo, only minor gaps/holes are acceptable.
* Minor stitching errors are acceptable but those with significant stitching artifacts may be rejected.

**Note on video files**

[The Street Publish API also supports video uploads](https://support.google.com/maps/answer/7662671?hl=en) ([if they contain the Camera Motion Metadata Spec (CAMM) standard](https://developers.google.com/streetview/publish/camm-spec#data-format)).

The photoSequence method ([examples here](https://github.com/smarquardt/samples-for-svpub)) is required for video uploads to the Street View Publish API, but [requires authorisation from Google to use](https://developers.google.com/streetview/ready).

> Please note that, as of May 2018, access to methods and documentation for 360 photo sequences in the Street View Publish API is by invitation only. 

Unfortunately they are not currently accepting new applications, so we we're unable to add this functionality to this script at present. This task is in the backlog.

We do plan on adding support for video uploads in the future, however at present, they are not supported.

### Installation

#### 1. Create Google Cloud project

You will need a Google Cloud project to access the API's. Login to the [GCP Console](https://console.developers.google.com/).

_Note: You will need to fill in registration details if this is your first time using the console._

![GCP create new project screen shot](/readme-images/gcp-new-project.png)

The project name can be anything you want. It will only be visible to you in the GCP Console.

_Note: you can create a GCP project using a different account than the one you want to use to upload to GSV._

#### 2 Enable correct Google API's for GCP project

This script requires the following Google API's to work:

* [Google Geocoding API](https://console.cloud.google.com/google/maps-apis/apis/geocoding-backend.googleapis.com) (optional) (to lookup address info and place information against each photo)
* [Street View Publish API](https://console.cloud.google.com/apis/library/streetviewpublish.googleapis.com) (used to send photos to Street View)

To enable these services, click each of the links above (making sure the menu bar at the top shows the project you just created) and select enable.

_Important: [You should also be aware the geocoding API charges per request](https://developers.google.com/maps/documentation/geocoding/usage-and-billing). Although at the time of writing Google offer $200 free Maps request per month (good for 40k requests). Configuring this API is optional, but it is essential you enable this API if you want to earn Local Guides points for Street View uploads. Uploading to Street View will not incur any GCP charges. [All use of Google Street View Publish API is free of charge](https://developers.google.com/streetview/publish/pricing)._

#### 3 Obtain authorisation credentials

If this is your first time creating a project you might see the message:

![GCP configure consent warning screen shot](/readme-images/gcp-oauth-consent-screen-warning.png)

>"To create an OAuth client ID, you must first set a product name on the consent screen."

Click the "Configure consent screen" button to do this.

![GCP configure consent warning screen shot](/readme-images/gcp-oauth-consent-screen-config.png)

The only field you need to fill in is "Application name". This name will be shown when you authenticate to allow the script to use your Google account to publish to Street View.

Once you have set the required consent information, select "API & Services" > "Credentials".

![GCP create credentials](/readme-images/gcp-create-credentials.png)

Now select "Create credentials" > "OAuth client ID"

![GCP create OAuth client ID](/readme-images/gcp-create-oauth-client-id.png)

Select Application type as "Other".

Enter a name for the credentials. This is helpful for tracking who these credentials are for.

![GCP OAuth credentials](/readme-images/gcp-oauth-credentials.png)

If everything is successful, Google will generate a client ID and client secret. Make a note of these.

_Note: Never share your client secret with anyone (including Trek View). Treat it like a password. If someone else has your client secret, there is a risk they can access your GCP account and modify projects (which can incur charges)._

#### 4 Enter you credentials into the config file

Copy the Google client ID and client secret values generated during step 3 in the config.ini file.

```
[googleauth]
client_id = YOUR_CLIENT_ID_HERE
client_secret = YOUR_CLIENT_SECRET_HERE

```

#### 5 Authenticate your Google account

You must authenticate with Google using the Google account you want to use to use to upload to GSV using (shown as the owner of the photos in the Google UI).

You will be promoted to do this when creating your first Google Street View tour.

When you do this you will need to authenticate your Google account by following the instructions.

```
Go to the following link in your browser: https://accounts.google.com/o/oauth2/v2/auth?client_id=ID
```

A URL will be shown that you must copy and open in a browser. You will then be prompted to allow your application to use your Google account.

![Google account permissions screen shot](/readme-images/google-permissions.png)

You'll be prompted to allow the "application" (the GCP project you created) permissions to upload to Street View. Your details are not shared with anyone else (including Trek View).

![Google account login screen shot](/readme-images/authenticate-google-account.png)

![Google account code](/readme-images/authenticate-google-account-code.png)

If you have multiple account, ensure you select the Google account you want to upload Street View photos too.

Then enter the code shown on this page in the command line.

```
Enter verification code: 
```

If unsuccessful you'll see the message:

```
Authentication has failed: invalid_grantMalformed auth code.
```

Everytime you upload to Street View, you will also need to agree to Google's Terms of Service or the tour creation will be aborted:

```
Do you agree to Google’s Terms of Service? https://policies.google.com/terms [y/N]:
```

If you do not agree, the upload to GSV will be aborted.


## Quick start guide

### Format

* t: time (default is `GPSdatetime`)
	- gps (`GPSdatetime`)
	- original (`originaldatetime`)

### Format

```
python gsv.py -t [TIME OPTION] [INPUT PHOTO DIRECTORY]
```

```
python gsv.py -t gps INPUT
```

## FAQ

**How long does it take for footage to be posted publically on Street View?**

After your footage has been sent to Google for processing, the overall process usually takes around 2 weeks. 

The first thing that will happen within the first few days is 360 images will be placed on Google Maps as blue dots which can be viewed.

## Support 

We offer community support for all our software on our Campfire forum. [Ask a question or make a suggestion here](https://campfire.trekview.org/c/support/8).

## License

Google Street View Uploader is licensed under a [GNU AGPLv3 License](https://github.com/trek-view/google-street-view-uploader/blob/master/LICENSE.txt).
