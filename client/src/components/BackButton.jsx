import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({ to, className = '' }) => {
  const navigate = useNavigate();
  const handleBack = () => (to ? navigate(to) : navigate(-1));

  return (
    <button
      onClick={handleBack}
      className={`flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors font-medium text-sm ${className}`}
    >
      <ArrowLeft size={18} />
      Back
    </button>
  );
};

export default BackButton;
