# Mapillary Uploader

## In one sentence

Command line Python script that 1) takes a directory of geotagged 360 images, 2) validates they contain correct 360 metadata, 3) injects Mapillary EXIF data, and 4) uploads and publishes them to a Mapillary accounts.

## Why we built this

We uploads millions of images to Mapillary every year. Mapillary do have their own tools that are generally well suited to uploading content, namely [Mapillary Tools (command line)](https://github.com/mapillary/mapillary_tools) and the [Mapillary Desktop Uploader](https://www.mapillary.com/desktop-uploader).

One of our future planned products is a web app uploader (similar functionality to the old [Tourer](https://github.com/trek-view/tourer)). Whilst Mapillary Tools could be a solution to this, we wanted more lightweight, tailored solution we could use in our image processing pipeline.

The [Mapillary API currently supports querying (GET) of sequences and image](https://www.mapillary.com/developer/api-documentation/). However no public upload API is documented.

Though it does exist. The Mapillary tools includes pure Python code that shows [authentication](https://github.com/mapillary/mapillary_tools/blob/master/mapillary_tools/commands/authenticate.py), [process](https://github.com/mapillary/mapillary_tools/blob/d19e7b5712da83eda279113dbdfc62c7e444638f/mapillary_tools/processing.py) and [upload](https://github.com/mapillary/mapillary_tools/blob/d19e7b5712da83eda279113dbdfc62c7e444638f/mapillary_tools/uploader.py) functions for images. 

Really this repository exists as a proof of concept for said web app, allowing us to dig into this code deeper, understand it, and build a wrapper around what we find for our own Mapillary upload tool, the Mapillary Uploader.

## How it works

### Overview

1. You use [Sequence Maker](https://github.com/trek-view/sequence-maker) to create photo connections
2. You define the panoramic photos to upload
3. The script validates that they meet the minimum criteria
5. You define the Mapillary authentication data
6. The script updates the images uploaded to Google Street View with connection information (to create blue line)
7. Mapillary publishes your images within 72 hours

### The details

Mapillary has a concept of images and sequences. A sequence is a series of images (e.g. a series of 360 images on a hiking route).

[Read more about Mapillary sequenece and images in their API documentation](https://www.mapillary.com/developer/api-documentation/#sequences).

[You can authenticate on behalf of the user using oAuth on Mapillary](https://www.mapillary.com/developer/api-documentation/#oauth).

[There are 4 steps to upload imagery to Mapillary via the API](https://www.mapillary.com/developer/api-documentation/#uploading-imagery):

1. Prepare the imagery for uploading
2. Create an upload session
3. Upload the imagery to the upload session
4. Publish the upload session

Note the prepare imagery section only mentions the fields: `MAPLongitude`, `MAPLatitude`, and `MAPCaptureTime`.

However, [the Mapillary desktop uploader](https://www.mapillary.com/desktop-uploader) adds the following fields: 

```
  "EXIF:ImageDescription": {
    "id": 270,
    "table": "Exif::Main",
    "val": "{\"MAPDeviceMake\": \"GoPro\", \"MAPOrientation\": 1, \"MAPAltitude\": 147.176, \"MAPSettingsUserKey\": \"pG6L5dj57PAuxaEUUgj9hA\", \"MAPPhotoUUID\": \"8422e84c-8ef7-4d9b-9888-4f91601071ef\", \"MAPDeviceModel\": \"GoPro Fusion FS1.04.01.80.00\", \"MAPCompassHeading\": {\"TrueHeading\": 0.0, \"MagneticHeading\": 0.0}, \"MAPMetaTags\": {\"strings\": [{\"key\": \"mapillary_tools_version\", \"value\": \"0.5.0\"}, {\"key\": \"mapillary_uploader_version\", \"value\": \"1.2.4\"}]}, \"MAPSettingsUsername\": \"trekviewhq\", \"MAPCaptureTime\": \"2020_04_16_11_24_34_000\", \"MAPLatitude\": 51.319947222222225, \"MAPSequenceUUID\": \"afe1e68f-f967-4eb2-8b15-54b76248bdd9\", \"MAPLongitude\": -0.8031750000000001}"
  },
```

You can also see how this is written in [Mapillary Tools exif_write.py](https://github.com/mapillary/mapillary_tools/blob/080d73736adb0fe250aea897d86fe72a2d58ec6c/mapillary_tools/exif_write.py).

Notice also how the reponse contains Mapillary specific information (e.g. MAPSequenceUUID). 

[In the API docs](https://www.mapillary.com/developer/api-documentation/#create-an-upload-session):

> key: The upload path of your image. It has to be prefixed with the session's key_prefix, and suffixed with .jpg or .jpeg. You can choose its basename that follows the object key naming guidelines.

The script will append Mapillary JSON object similar to the above using the corresponding Sequence Maker fields:

* MAPCaptureTime >  GPSDateTime (if connection method gps / filename) or originalDateTime (if connection originalDateTime) value 
* MAPAltitude > original_altitude
* MAPLatitude > original_latitude
* MAPLongitude > original_longitude
* MAPDeviceMake > original_camera_make
* MAPDeviceModel > original_camera_model
* MAPCompassHeading > original_heading else photo.connection.n.heading_deg (of photo connection with positive distance_mtrs)
	- TrueHeading
	- MagneticHeading
* MAPOrientation > 
* MAPSequenceUUID > 

https://github.com/mapillary/mapillary_tools/blob/073aa96278e8de46cae77b6d4062f7269e81bc8d/mapillary_tools/geo.py

The script will upload all photos, and will retry 3 times for failures. It will also generate a tmp file that keeps tracks uploads (and returned photoids). This is placed in the input folder and will remain after scrip completes (or fails). This means you can look into this to find photoids in the future (if you need to check publish status) or restart the script from where it left off in case of failures (the script will check for this file in specified directory prior to execution).

### Imagerequirements

The script performs a number of checks before creating a tour to ensure all your panoramas meet specific requirements for [Mapillary](https://help.mapillary.com/hc/en-us/articles/115001663165-Web-uploader).

* [Sequence Maker](https://github.com/trek-view/sequence-maker) data must be present.
* [Photo Sphere XMP metadata must be included in the photo medadata](https://developers.google.com/streetview/spherical-metadata). (The Exif XMP tag, "ProjectionType=equirectangular")
* [Photos must not exceed a resolution of 100 megapixels](https://help.mapillary.com/hc/en-us/articles/115001663165-Web-uploader).
* [Photos must not exceed a filesize of 50MB](https://help.mapillary.com/hc/en-us/articles/115001663165-Web-uploader).
* [Supported file types](https://www.mapillary.com/developer/api-documentation/#uploading-imagery)
	- `.jpg`
	- `.jpeg`

Video files are not supported.

## FAQ

**How long does it take for footage to be posted publically on Mapillary?**

After your footage has been sent to Mapillary for processing, the overall process usually takes around 72 hours before your images appear publically on the map. If you login in to the Mapillary Web App, [you will be able to see all the images pending being published](https://www.mapillary.com/app/).

## Support 

We offer community support for all our software on our Campfire forum. [Ask a question or make a suggestion here](https://campfire.trekview.org/c/support/8).

## License

Mapillary Uploader is licensed under a [GNU AGPLv3 License](https://github.com/trek-view/mapillary-uploader/blob/master/LICENSE.txt).
