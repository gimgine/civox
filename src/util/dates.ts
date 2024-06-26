export const formatDateMonthYear = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
};

export const formatDateTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const elapsed = now.getTime() - date.getTime();
  let elapsedString = '';
  switch (true) {
    case elapsed < 1000:
      elapsedString = `1 second ago`;
      break;
    case elapsed < 60000:
      const seconds = Math.floor(elapsed / 1000);
      elapsedString = `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`;
      break;
    case elapsed < 3600000:
      const minutes = Math.floor(elapsed / 60000);
      elapsedString = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
      break;
    case elapsed < 86400000:
      const hours = Math.floor(elapsed / 3600000);
      elapsedString = `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
      break;
    default:
      const days = Math.floor(elapsed / 86400000);
      elapsedString = `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  return elapsedString;
};
