import axios from "axios";
const getUserInfo = async (phone) => {
    try {
        const response = await axios.get('https://motosmart.app/api/v1/mautic/user_data_chat', {
            params: {
                user_token: 'zybubWjJaUNbB5nhKzvq',
                user_uuid: '7RzqaGMLRLkZMz2dBCg8FzZ9AbcjLaHhLgYbswR81397',
                phone: phone
            }
        });
        return response.data; // Retornamos la respuesta completa
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
};

export default getUserInfo