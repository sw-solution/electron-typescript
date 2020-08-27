# Facebook 360 Uploader

## In one sentence

Command line Python script that 1) takes geotagged 360 images or a 360 video, 2) validates they contain correct 360 metadata, 3) allows you to create and upload as Facebook post to your profile or page you own.

## Why we built this

[Facebook has lots of 360 iniatives](https://facebook360.fb.com/); from sharing 360 photos on the web platform to Oculus VR (owned by Facebook).

We (Trek View) have our own Facebook page where we share snippets (5 - 6 360 photos) of a recent tour we've shot. Doing this through the UI can be time consuming (esp. if uploding more than 10 images or paticularly large videos).

As [Facebook offers programmatic publishing tools](https://facebook360.fb.com/learn/) we wanted to make use of them to upload 360 images / videos more effeciently as a [multi-photo story](https://developers.facebook.com/docs/graph-api/photo-uploads/) or as a video post (https://developers.facebook.com/docs/graph-api/video-uploads/)

Facebook 360 Uploader was the result.

## How it works

### Overview

1. You define the authentication data
2. You define the 360 photo(s) or video you want to upload
3. The script validates the selected files are correct 360 metadata
4. You define the text of the post to accompany the post
5. The script starts the upload of content to Facebook until upload complete and images published

### The details

Authenticating to Facebook required a Facebook app to authenticate. In order to use this script, you'll need to first create your own Facebook app to generate an app id and app secret.

https://stackoverflow.com/questions/21978728/obtaining-a-facebook-auth-token-for-a-command-line-desktop-application

[You can create a Facebook app here](https://developers.facebook.com/apps). You will need to enable the product "Facebook login".

[360 Photos must fulfill the following requirements for Facebook to process them properly](https://facebook360.fb.com/editing-360-photos-injecting-metadata/) (these are validated by the script):

* The photo must have a 2:1 aspect ratio
* The Exif XMP tag, "ProjectionType=equirectangular"
* Photos should be less than 30,000 pixels in any dimension, and less than 135,000,000 pixels in total size
* File sizes could be as big as 45 MB (JPEG) or 60 MB (PNG). We recommend using JPEG for 360 photos and keeping the file size less than 20-30 MB.

The [Facebook API uses a similar standard to Google for 360 images](https://developers.facebook.com/docs/graph-api/reference/photo/#fields). [Google standard for reference](https://developers.google.com/streetview/spherical-metadata).

For video files, the script takes advantage of the [Facebook API's Resumable Uploading function](https://developers.facebook.com/docs/graph-api/video-uploads/#resumable). Videos are published to graph-video.facebook.com instead of the regular Graph API URL (graph.facebook.com).

### Limitations / Considerations


## Requirements

### OS Requirements

Works on Windows, Linux and MacOS.

### Software Requirements

* Python version 3.6+

### Image / Video requirements

* The photo must have a 2:1 aspect ratio
* The Exif XMP tag, "ProjectionType=equirectangular"
* Photos should be less than 30,000 pixels in any dimension, and less than 135,000,000 pixels in total size
* File sizes could be as big as 45 MB (JPEG) or 60 MB (PNG). We recommend using JPEG for 360 photos and keeping the file size less than 20-30 MB.

[You can read more about these requirements in the Facebook documentation](https://facebook360.fb.com/editing-360-photos-injecting-metadata/).

## Quick start guide

### Format

```
python fb360.py [INPUT PHOTO DIRECTORY OR VIDEO FILE]
```




## Support 

We offer community support for all our software on our Campfire forum. [Ask a question or make a suggestion here](https://campfire.trekview.org/c/support/8).

## License

Facebook 360 Uploader is licensed under a [GNU AGPLv3 License](https://github.com/trek-view/facebook-360-uploader/blob/master/LICENSE.txt).
