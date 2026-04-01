"use client";
import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Card, Table } from 'react-bootstrap';
import StaffNavbar from '@/app/components/StaffNavbar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

    // ข้อมูลสำหรับกราฟ (เรียงจากเดือนเก่าไปเดือนใหม่)
    const chartData = [...monthlySummaryList].reverse().map(item => ({
        name: `${item.month}/${item.year}`,
        bookings: item.totalBookings,
        guests: item.totalGuests
    }));

    return (
        <div className="bg-gray-50 min-h-screen">
            <StaffNavbar />
            <Container className="mt-5">
                <Card className="shadow border-info">
                    <Card.Header className="bg-info text-white">
                        <h4 className="mb-0 text-center">📊 สรุปยอดการจองรายเดือน</h4>
                    </Card.Header>
                    <Card.Body>
                        <h5 className="text-center mb-4 text-secondary">📈 กราฟแสดงจำนวนการจองและจำนวนแขก</h5>
                        <div style={{ width: '100%', height: 350, marginBottom: '2rem' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                                    <XAxis dataKey="name" />
                                    <YAxis yAxisId="left" domain={[0, 20]} allowDataOverflow ticks={[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]} />
                                    <YAxis yAxisId="right" orientation="right" domain={[0, 50]} allowDataOverflow ticks={[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50]} />
                                    <Tooltip contentStyle={{ borderRadius: '10px' }} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                    <Bar yAxisId="left" dataKey="bookings" name="จำนวนครั้งที่จอง" fill="#17a2b8" radius={[4, 4, 0, 0]} barSize={40} />
                                    <Bar yAxisId="right" dataKey="guests" name="จำนวนแขก (ท่าน)" fill="#ffc107" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        
                        <h5 className="text-center mb-3 text-secondary">📋 รายละเอียดแบบตาราง</h5>
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
