// dependencies
const AWS = require('aws-sdk');
const util = require('util');

// get reference to S3 client
const srcS3 = new AWS.S3();

// get reference to S3 client
const dstS3 = new AWS.S3({accessKeyId:  process.env.TARGET_ACCESSKEY_ID, secretAccessKey: process.env.TARGET_ACCESSKEY_SECRET, region: process.env.TARGET_REGION});

exports.handler = async (event, context, callback) => {

    // Read options from the event parameter.
    console.log("Reading options from event:\n", util.inspect(event, {depth: 5}));
    const srcBucket = event.Records[0].s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    const srcKey    = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

    // Target
    const dstBucket = process.env.TARGET_BUCKET;
    const dstKey    = srcKey;

    // Download the image from the S3 source bucket. 
    try {
        console.log('Getting object from ' + srcBucket + '/' + srcKey );
        const params = {
            Bucket: srcBucket,
            Key: srcKey
        };
        var srcObject = await srcS3.getObject(params).promise();
        console.log(srcObject);

    } catch (error) {
        console.log(error);
        return;
    }  

   
    // Upload the thumbnail image to the destination bucket
    try {
        console.log('Putting Object to ' + process.env.TARGET_REGION + '@' + dstBucket + '/' + dstKey);
        const destparams = {
            Bucket: dstBucket,
            Key: dstKey,
            Body: srcObject.Body
        };

        const putResult = await dstS3.putObject(destparams).promise(); 
        
    } catch (error) {
        console.log(error);
        return;
    } 


    console.log('Successfully copy ' + srcBucket + '/' + srcKey + ' to ' + process.env.TARGET_REGION + '@' + dstBucket + '/' + dstKey);


};