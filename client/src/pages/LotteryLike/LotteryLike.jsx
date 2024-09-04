import React from "react";
import { useQuery } from "react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { getLotteryLike } from "../../utils/api";
import { PuffLoader } from "react-spinners";
import "./LotteryLike.css";

const LotteryLike = () => {
    const { pathname, state } = useLocation(); // Destructure pathname and state from location
    const navigate = useNavigate();

    // Extract ID from the pathname
    const id = pathname.split("/").pop();

    // Fetch lottery data with useQuery
    const { data, isLoading, isError } = useQuery(
        ["LotteryLike", id], 
        () => getLotteryLike(id),
        {
            refetchOnWindowFocus: false,  // Disable refetch on window focus
            staleTime: 5000,              // Prevent frequent refetching by setting a stale time
            cacheTime: 10000,             // Keep the data in cache for some time
        }
    );

    if (isLoading) return <div className="flexCenter paddings"><PuffLoader /></div>;
    if (isError) return <div className="flexCenter paddings">Error while fetching lottery details</div>;

    const { image, title, description, hosted, endDate, conditions, prizes, link } = data || {};

    return (
        <div className="wrapper">
            <div className="flexColStart paddings innerWidth lottery-container">
                {/* Lottery details */}
                {image && <img src={image} alt="Lottery" className="lottery-image" />}
                <div className="flexColStart lottery-details head">
                    {title && <span className="primaryText">Title: <span className="primary2Text">{title}</span></span>}
                    {description && <span className="primaryText">Description: <span className="primary2Text">{description}</span></span>}
                    {hosted && <span className="primaryText">Hosted By: <span className="primary2Text">{hosted}</span></span>}
                    {endDate && <span className="primaryText">Lottery Draw Time: <span className="primary2Text">{new Date(endDate).toLocaleString()}</span></span>}
                    {conditions?.length > 0 && <span className="primaryText">Conditions: <span className="primary2Text">{conditions.join(", ")}</span></span>}
                    {prizes?.length > 0 && (
                        <>
                            <span className="primaryText">Prizes:</span>
                            {prizes.map(({ place, description, icon }, idx) => (
                                <div key={idx} className="primary2Text">
                                    <span className="placeNumber">Place {place}</span>: {description} ({icon})
                                </div>
                            ))}
                        </>
                    )}
                    {link && <span className="primaryText">Link: <a href={link} target="_blank" rel="noopener noreferrer" className="primary2Text">{link}</a></span>}
                    <span className="primary3Text">To enter this draw, complete all conditions on the provided link, and you'll be automatically entered.</span>
                </div>
            </div>
        </div>
    );
};

export default LotteryLike;
