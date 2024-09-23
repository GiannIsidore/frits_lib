// externalbookinfo/page.tsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
// import { useRouter } from "next/router";

interface ExternalBookInfo {
  ExternalID: number;
  BookID: number;
  Title: string;
  ExternalSource: string;
  AdditionalInfo: string;
  LastUpdated: string;
}

const ExternalBookInfoPage = () => {
  //   const router = useRouter();
  const [externalInfos, setExternalInfos] = useState<ExternalBookInfo[]>([]);

  useEffect(() => {
    fetchExternalBookInfo();
  }, []);

  const fetchExternalBookInfo = async () => {
    try {
      const response = await axiosInstance.get(
        "/backend/api/ExternalBookInfo.php?action=getAll"
      );
      setExternalInfos(response.data.externalInfos);
    } catch (error) {
      console.error("Error fetching external book info:", error);
    }
  };

  return (
    <div className="external-book-info-container">
      <h2>External Book Information</h2>
      <ul>
        {externalInfos.map((info) => (
          <li key={info.ExternalID}>
            <h3>{info.Title}</h3>
            <p>
              Source: {info.ExternalSource} <br />
              Last Updated: {new Date(info.LastUpdated).toLocaleString()}
            </p>
            <p>{info.AdditionalInfo}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExternalBookInfoPage;
