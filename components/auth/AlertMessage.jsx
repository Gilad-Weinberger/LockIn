const AlertMessage = ({ message, type = "error" }) => {
  if (!message) return null;

  const styles = {
    error: "bg-red-50 border border-red-200 text-red-700",
    success: "bg-green-50 border border-green-200 text-green-700",
  };

  return (
    <div className={`${styles[type]} rounded-lg p-3 text-sm`}>{message}</div>
  );
};

export default AlertMessage;
