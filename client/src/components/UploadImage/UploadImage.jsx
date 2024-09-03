import React, { useEffect, useRef, useState } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { Box, Typography } from "@mui/material";
import "./UploadImage.css";

const UploadImage = ({
  lotteryDetails,
  setLotteryDetails, // Correct the prop name to match
  nextStep,
  prevStep,
}) => {
  const [imageURL, setImageURL] = useState(lotteryDetails.image);
  const cloudinaryRef = useRef();
  const widgetRef = useRef();

  const handleNext = () => {
    setLotteryDetails((prev) => ({ ...prev, image: imageURL })); // Use the correct function name
    nextStep();
  };

  useEffect(() => {
    if (window.cloudinary) {
      cloudinaryRef.current = window.cloudinary;
      widgetRef.current = cloudinaryRef.current.createUploadWidget(
        {
          cloudName: "dhlgmuuvc",
          uploadPreset: "hojzo8q1",
          maxFiles: 1,
        },
        (err, result) => {
          if (result.event === "success") {
            setImageURL(result.info.secure_url);
          }
        }
      );
    } else {
      console.error("Cloudinary library not loaded");
    }
  }, []);

  return (
    <Box className="flexColCenter uploadWrapper">
      {!imageURL ? (
        <Box
          className="flexColCenter uploadZone"
          onClick={() => widgetRef.current?.open()}
        >
          <AiOutlineCloudUpload size={50} color="grey" />
          <Typography>Upload Image</Typography>
        </Box>
      ) : (
        <Box
          className="uploadedImage"
          onClick={() => widgetRef.current?.open()}
        >
          <img src={imageURL} alt="Uploaded" />
        </Box>
      )}

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 2 }}>
        <button className="button button-green" onClick={prevStep}>Back</button>
        {imageURL && (
          <button className="button button-blue" onClick={handleNext}>Next</button>
        )}
      </Box>
    </Box>
  );
};

export default UploadImage;
