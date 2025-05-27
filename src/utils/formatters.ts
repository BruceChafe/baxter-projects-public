export const formatResponseTime = (minutes: string | number) => {
    const total = parseFloat(typeof minutes === 'number' ? minutes.toString() : minutes);
    if (isNaN(total)) return 'N/A';
    const hrs = Math.floor(total / 60);
    const mins = Math.round(total % 60);
    return hrs > 0 ? `${hrs} hr${hrs > 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}` : `${mins} min${mins !== 1 ? 's' : ''}`;
  };