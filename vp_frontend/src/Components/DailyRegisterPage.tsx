import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import IMBTable from './IMBTable'; // Import the IMBTable component
import { useLocation, useNavigate } from 'react-router-dom';

const DailyRegisterPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract data passed via state
  const { selectedDate, visitorData } = location.state || {};

  // Format the selected date to Indian format (DD-MM-YYYY)
  const formatDateToIndian = (date: string): string => {
    if (!date) return 'Invalid Date';
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Intl.DateTimeFormat('en-IN', options).format(new Date(date));
  };

  

  return (
    <Box sx={{ padding: '2rem' }} id="daily-register-page">      
    <style>
        {`
          @media print {
            #daily-register-page, #daily-register-page * {
              visibility: visible !important;
            }            
          }
        `}
      </style>
      <Box sx={{ textAlign: 'right', marginTop: '1rem' }} className="no-print">
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate(-1)} // Navigate back
          sx={{ marginRight: '1rem' }}
        >
          Back
        </Button>
      </Box>
      <div>
        <IMBTable
          data={visitorData.map((visitor: any) => ({
            ...visitor,
            date: new Date(visitor.date).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
          }))}
          visibleColumns={['name', 'mobile', 'adhaar', 'toVisit', 'date']}
          columnMap={{
            name: 'Name',
            mobile: 'Mobile',
            adhaar: 'ID',
            toVisit: 'Whom To Visit',
            date: 'Entry Time',
          }}
          title={`Daily Visitor Register for ${formatDateToIndian(selectedDate)}`}
          noDataMessage="No visitors found for the selected date."
          showPagination={false} // Pagination is disabled
          showFilters={true} // Filters are disabled
          rowAction={null}
        />
      </div>           
    </Box>
  );
};

export default DailyRegisterPage;