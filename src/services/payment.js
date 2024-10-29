import axios from "axios";


export  const fetchallPay = async () => {
    try {
        const response = await axios.get('https://querotaxa.onrender.com/api/payment', {
            
        }, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        // console.log(response.data);
        return response.data
    } catch (error) {
        console.error('Error making POST request:', error.response ? error.response.data : error.message);
    }
};

