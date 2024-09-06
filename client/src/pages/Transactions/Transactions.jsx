import React, { useEffect, useState } from "react";
import { Box, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, TableContainer } from "@mui/material";
import { toast } from "react-toastify";
import { useAuth0 } from "@auth0/auth0-react";
import { fetchUserTransactions } from "../../utils/api"; // Import the function to fetch transactions

const Transactions = () => {
    const { user } = useAuth0(); // Get user details from Auth0 context
    const [transactions, setTransactions] = useState([]); // State to store user transactions
    const [loading, setLoading] = useState(true); // State to handle loading

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await fetchUserTransactions(user.email); // Fetch user transactions
                setTransactions(response.transactions);
                setLoading(false); // Set loading to false after data is fetched
            } catch (error) {
                toast.error("Failed to fetch transactions. Please try again later.", {
                    position: "bottom-right",
                    autoClose: 3000,
                });
                setLoading(false);
            }
        };

        if (user) {
            fetchTransactions(); // Fetch transactions only if user is logged in
        }
    }, [user]);

    return (
        <Box sx={{ padding: "2rem" }}>
            <Typography variant="h4" gutterBottom>
                Transaction History
            </Typography>
            {loading ? (
                <Typography>Loading transactions...</Typography>
            ) : transactions.length === 0 ? (
                // Show this box if no transactions are found
                <Box sx={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px", backgroundColor: "#f9f9f9", textAlign: "center" }}>
                    <Typography variant="body1">
                        You did not perform any transactions.
                    </Typography>
                </Box>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Transaction ID</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Amount</TableCell>
                                <TableCell>Date</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>{transaction.id}</TableCell>
                                    <TableCell>{transaction.transactionType}</TableCell>
                                    <TableCell>${transaction.amount}</TableCell>
                                    <TableCell>{new Date(transaction.createdAt).toLocaleDateString("en-GB")}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default Transactions;
