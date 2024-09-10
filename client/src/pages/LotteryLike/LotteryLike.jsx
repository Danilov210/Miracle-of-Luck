import React, { useContext, useState } from "react";
import { useQuery, useMutation } from "react-query";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import { getLotteryLike, CancelLotteryLike } from "../../utils/api";
import { PuffLoader } from "react-spinners";
import { Box, Card, CardContent, Typography, Collapse, IconButton, Button } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import UserDetailContext from "../../context/UserDetailContext";
import "./LotteryLike.css";

const LotteryLike = () => {
    const location = useLocation();
    const { state } = location;
    const cancelLotteryOption = state?.cancelLotteryOption;
    const navigate = useNavigate();
  
     // State to control expandable panels
    const id = location.pathname.split("/").pop();
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);
    const [participationExpanded, setParticipationExpanded] = useState(false);
    const [prizesExpanded, setPrizesExpanded] = useState(false);
    const [isCancelLotteryDisabled, setIsCancelLotteryDisabled] = useState(false);
    const { setUserDetails } = useContext(UserDetailContext);


    // Fetch lottery data with useQuery
    const { data, isLoading, isError } = useQuery(["LotteryLike", id], () => getLotteryLike(id), {
        refetchOnWindowFocus: false,
        staleTime: 5000,
        cacheTime: 10000,
    });

    // Mutation for canceling the lottery
    const cancelLotteryMutation = useMutation({
        mutationFn: () => CancelLotteryLike(id),
        onMutate: () => setIsCancelLotteryDisabled(true),
        onSuccess: (response) => {
            setUserDetails((prev) => ({
                ...prev,
            }));
            toast.success(response.data.message, { position: "bottom-right", autoClose: 3000 });
            setTimeout(() => navigate("/ownedlotteries"), 1000);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || error.message, { position: "bottom-right" });
            setIsCancelLotteryDisabled(false);
        },
        onSettled: () => setIsCancelLotteryDisabled(true),
    });

    if (isLoading) return <div className="flexCenter paddings"><PuffLoader /></div>;
    if (isError) return <div className="flexCenter paddings">Error while fetching lottery details</div>;

    const { image, title, description, hosted, endDate, startDate, conditions, prizes, link } = data || {};

    return (
        <div className="wrapper">
            <div className="flexColStart paddings innerWidth lottery-container">
                {image && <img src={image} alt="Lottery" className="lottery-image" />}

                {/* Lottery Details Section */}
                <Card className="lottery-card">
                    <CardContent>
                        <Typography variant="h5" gutterBottom>{title}</Typography>
                        <Typography color="textSecondary">Hosted by: {hosted}</Typography>
                        <Typography color="textSecondary">Start Date: {new Date(startDate).toLocaleDateString('en-GB')}</Typography>
                        <Typography color="textSecondary">Draw Time: {new Date(endDate).toLocaleString('en-GB', { hour12: false })}</Typography>
                    </CardContent>
                </Card>

                {/* Description Section with Expandable Panel */}
                <Card className="description-card">
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">Description</Typography>
                            <IconButton onClick={() => setDescriptionExpanded(!descriptionExpanded)}>
                                {descriptionExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                        </Box>
                        <Collapse in={descriptionExpanded}>
                            <Typography variant="body2">{description}</Typography>
                        </Collapse>
                    </CardContent>
                </Card>

                {/* Participation Section with Expandable Panel */}
                <Card className="participation-card">
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6">Participation Details</Typography>
                            <IconButton onClick={() => setParticipationExpanded(!participationExpanded)}>
                                {participationExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                        </Box>
                        <Collapse in={participationExpanded}>
                            <Typography variant="body2">
                                {conditions ? conditions.join(", ") : "No specific conditions provided."}
                            </Typography>
                        </Collapse>
                    </CardContent>
                </Card>

                {/* Prizes Section with Expandable Panel */}
                {prizes?.length > 0 && (
                    <Card className="prizes-card">
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">Prizes</Typography>
                                <IconButton onClick={() => setPrizesExpanded(!prizesExpanded)}>
                                    {prizesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                </IconButton>
                            </Box>
                            <Collapse in={prizesExpanded}>
                                {prizes.map(({ place, description, icon }, idx) => (
                                    <Typography key={idx}>
                                        Place {place}: {description} ({icon})
                                    </Typography>
                                ))}
                            </Collapse>
                        </CardContent>
                    </Card>
                )}

                {/* Link Section */}
                {link && (
                    <Typography className="primary3Text" variant="body2">
                        Link: <a href={link} target="_blank" rel="noopener noreferrer" >{link}</a>
                    </Typography>
                )}


                <Typography className="primary3Text" variant="body2">
                    To enter this draw, complete all conditions on the provided link, and you'll be automatically entered.
                </Typography>


                {/* Cancel Lottery Button */}
                {cancelLotteryOption && (<button
                    className="button button-red"
                    onClick={() => cancelLotteryMutation.mutate()}
                    disabled={isCancelLotteryDisabled}
                >
                    Cancel Lottery
                </button>
                )}
            </div>
        </div>
    );
};

export default LotteryLike;


