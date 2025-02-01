import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';

const formatDate = (dateString: string): string => {
    try {
        // Replace the last '/' with a space to match the expected format
        const correctedDateString = dateString.replace(/\/(?=\d{2}:\d{2}$)/, ' ');

        // Parse the input date string
        const parsedDate = parse(correctedDateString, 'yyyy / MM / dd / HH:mm', new Date());

        // Format the date to the desired output format
        const formattedDate = format(parsedDate, "EEEE d 'de' MMMM 'a las' h a 'del' yyyy", { locale: es });

        return formattedDate;
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'Fecha inválida';
    }
};

export default formatDate;