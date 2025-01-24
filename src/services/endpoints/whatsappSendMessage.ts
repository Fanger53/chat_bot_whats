import axios from 'axios';

export const sendMessage = async (phone: string, message: string) => {
    try {
        const response = await axios.post('http://162.243.164.134:3002/send-message', {
            phone: phone,
            message: message
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        if (response.status === 200) {
            console.log("Mensaje enviado exitosamente");
        } else {
            console.log(`Error al enviar mensaje: ${response.data}`);
        }
    } catch (error) {
        console.error(`Error al enviar mensaje: ${error}`);
    }
};