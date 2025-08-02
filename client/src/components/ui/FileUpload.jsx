import { cn } from "@lib/utils";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({ onChange, resetFileInput }) => {
  const [file, setFile] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);
  const fileInputRef = useRef(null);

  // reset file input when resetFileInput prop changes
  useEffect(() => {
    if (resetFileInput) {
      resetFileInput(() => {
        setFile(null);
        setImgSrc(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; // clear file-input
        }
      });
    }
  }, [resetFileInput]);

  // handle file change
  const handleFileChange = (newFile) => {
    const objectUrl = URL.createObjectURL(newFile);
    setImgSrc(objectUrl);
    setFile(newFile);
    onChange?.(newFile); // call onChange callback if provided
  };

  // trigger file-input click
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // configure drop-zone
  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: (acceptedFiles) => handleFileChange(acceptedFiles[0]),
    onDropRejected: (error) => {
      console.log("File rejected:", error);
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
      >
        {/* hidden file input */}
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          onChange={(e) => handleFileChange(e.target.files[0])}
          className="hidden"
        />

        {/* background pattern */}
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>

        {/* upload UI */}
        <div className="flex flex-col items-center justify-center">
          {!file && (
            <>
              <p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-sm">
                Upload file
              </p>
              <p className="relative z-20 font-sans font-normal text-center text-neutral-400 dark:text-neutral-400 text-sm mt-2">
                Drag or drop your files here or click to upload
              </p>
            </>
          )}

          {/* file preview */}
          <div className="relative w-full mt-4 mx-auto">
            {file && (
              <div>
                <img
                  src={imgSrc}
                  alt="upload-image"
                  className="aspect-square rounded-lg object-cover"
                />
              </div>
            )}
            {!file && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]",
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-600 flex flex-col items-center"
                  >
                    Drop it
                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  </motion.p>
                ) : (
                  <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
                )}
              </motion.div>
            )}

            {!file && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
              ></motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// GridPattern component
export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px  scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        }),
      )}
    </div>
  );
}
