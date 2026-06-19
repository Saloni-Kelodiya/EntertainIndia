export default function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary-100 text-primary-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    bollywood: 'bg-pink-100 text-pink-700',
    hollywood: 'bg-purple-100 text-purple-700',
    ott: 'bg-blue-100 text-blue-700',
    tv: 'bg-green-100 text-green-700',
    music: 'bg-yellow-100 text-yellow-700',
    reviews: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
