"use client";
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Card, Table } from 'react-bootstrap';
import StaffNavbar from '@/app/components/StaffNavbar';

export default function BookingSummaryPage() {
    const [bookings, setBookings] = useState([]);

    const fetchBookings = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/bookings/all_details');
            const res = await response.json();
            if (!res.isError) setBookings(res.data);
        } catch (error) { 
            console.error("Fetch Error:", error); 
        }
    };

    useEffect(() => { fetchBookings(); }, []);

    const monthlySummary = bookings.reduce((acc, b) => {
        if (!b.booking_date) return acc;
        const d = new Date(b.booking_date);
        const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[monthKey]) {
            acc[monthKey] = {
                monthKey,
                year: d.getFullYear(),
                month: String(d.getMonth() + 1).padStart(2, '0'),
                totalBookings: 0,
                totalGuests: 0
            };
        }
        acc[monthKey].totalBookings += 1;
        acc[monthKey].totalGuests += Number(b.number_of_guests || 0);
        return acc;
    }, {});

    const monthlySummaryList = Object.values(monthlySummary).sort((a, b) => b.monthKey.localeCompare(a.monthKey));

    return (
        <div className="bg-gray-50 min-h-screen">
            <StaffNavbar />
            <Container className="mt-5">
                <Card className="shadow border-info">
                    <Card.Header className="bg-info text-white">
                        <h4 className="mb-0 text-center">📊 สรุปยอดการจองรายเดือน</h4>
                    </Card.Header>
                    <Card.Body>
                        <Table striped bordered hover responsive className="text-center">
                            <thead className="table-info">
                                <tr>
                                    <th>เดือน/ปี</th>
                                    <th>จำนวนครั้งที่จอง</th>
                                    <th>จำนวนแขก (ท่าน)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {monthlySummaryList.length > 0 ? monthlySummaryList.map(item => (
                                    <tr key={item.monthKey}>
                                        <td>{`${item.month}/${item.year}`}</td>
                                        <td>{item.totalBookings}</td>
                                        <td>{item.totalGuests}</td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="3" className="text-center">ไม่มีข้อมูลสรุปยอดการจอง</td></tr>
                                )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}
