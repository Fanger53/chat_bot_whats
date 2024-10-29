import axios from "axios";

const postPoints = async (phone: string, birthday: string) => {
    try {
        const response = await axios.post('https://motosmart.info/api/v1/mautic/added_motopuntos_for_chat', 
        {
            user_token: 'zybubWjJaUNbB5nhKzvq',
            user_uuid: '7RzqaGMLRLkZMz2dBCg8FzZ9AbcjLaHhLgYbswR81397',
            phone: phone,
            birthday: birthday
        });
        
        console.log('Llamada iniciada:', response.data);
    } catch (error) {
        console.error('Error al iniciar la llamada:', error);
    }
}

export default postPoints;
