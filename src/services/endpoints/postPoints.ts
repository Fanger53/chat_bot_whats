import axios from "axios";

const postPoints = async (phone: string, birthday: string) => {
    try {
        const data = {
            user_token: 'zybubWjJaUNbB5nhKzvq',
            user_uuid: '7RzqaGMLRLkZMz2dBCg8FzZ9AbcjLaHhLgYbswR81397',
            phone: phone,
            birthday: birthday
        };

        const response = await axios.post('https://motosmart.app/api/v1/mautic/added_motopuntos_for_chat', data, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': JSON.stringify(data).length.toString()
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error posting points:', error);
        throw error;
    }
};

export default postPoints;
