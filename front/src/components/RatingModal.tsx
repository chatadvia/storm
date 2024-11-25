import React, { useEffect, useRef, useState } from 'react';
import { rateMovie } from './../services/movieService';

interface RatingModalProps {
  isOpen: boolean;
  initialRating: number;
  movieId: string;
  userId: string;
  onClose: () => void;
  onSubmit: (rating: number) => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ isOpen, initialRating, movieId, userId, onClose }) => {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(initialRating);
  const [loading, setLoading] = useState(false); // Para controlar o estado de carregamento
  const [error, setError] = useState<string | null>(null); // Para armazenar erros

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Verifica se o clique ocorreu fora do modal
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose(); // Fecha o modal se clicar fora
      }
    };

    // Adiciona o listener de clique quando o modal está aberto
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup para remover o listener quando o modal for fechado ou componente desmontado
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMouseEnter = (index: number) => {
    setHoveredRating(index);
  };

  const handleMouseLeave = () => {
    setHoveredRating(null);
  };

  const handleClick = (index: number) => {
    setSelectedRating(index);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      // Chama a função de serviço para enviar a avaliação
      await rateMovie(movieId, userId, selectedRating);
      alert('Avaliação enviada com sucesso!'); // Feedback simples
      window.location.reload();
      onClose(); // Fecha o modal após o sucesso
    } catch (error) {
      console.error(error);
      setError('Ocorreu um erro ao enviar sua avaliação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const currentRating = hoveredRating || selectedRating;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        ref={modalRef} 
        className="bg-white p-6 rounded-lg shadow-lg w-96 text-center"
      >
        <h2 className="text-lg font-bold mb-4">Confirmar Avaliação</h2>
        <p className="text-gray-700 mb-6">
          Você selecionou <span className="font-bold">{currentRating}</span> estrelas.
        </p>

        {/* Seção de estrelas */}
        <div className="flex justify-center space-x-2 mb-6">
          {[1, 2, 3, 4].map((index) => (
            <span
            key={index}
            role="button"
            tabIndex={0}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                handleClick(index);
              }
            }}
            aria-label={`Selecionar ${index} estrelas`}
            className={`cursor-pointer text-3xl ${
              index <= currentRating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
              ★
            </span>
          ))}
        </div>

        <div className="flex justify-center space-x-4">
        <button
            onClick={handleConfirm}
            disabled={loading} // Desativa o botão durante o carregamento
            className={`${
              loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
            } text-white px-4 py-2 rounded transition`}
          >
            {loading ? 'Enviando...' : 'Confirmar'}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
