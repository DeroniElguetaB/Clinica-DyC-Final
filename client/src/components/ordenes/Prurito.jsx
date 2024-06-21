import { Alert, Button, Modal, Textarea } from 'flowbite-react';
import { useEffect, useState,  useRef  } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function CommentPrurito({ postId }) {
  const { currentUser } = useSelector((state) => state.user);
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [comments, setComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [observaciones, setObservaciones] = useState(''); // Estado para el input adicional
  const navigate = useNavigate();
  
  const h1Ref = useRef();
  const pRefs = useRef([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const h1Content = h1Ref.current.innerText;
    const pContents = pRefs.current.map(p => p.innerText).join('\n');
    const combinedContent = `${h1Content}\n${pContents}`;
    let content = combinedContent;

    if (observaciones.trim()) {
      content += `\n\nObservaciones: \n- ${observaciones}`;
    }
    try {
      const res = await fetch('/api/comment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
          postId,
          userId: currentUser._id,
          name: 'Indicaciones Prurito',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setComment('');
        setCommentError(null);
        setComments([data, ...comments]);
        window.location.reload(); // Reload the page
      }
    } catch (error) {
      setCommentError(error.message);
    }
  };

  useEffect(() => {
    const getComments = async () => {
      try {
        const res = await fetch(`/api/comment/getPostComments/${postId}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    getComments();
  }, [postId]);

  const handleLike = async (commentId) => {
    try {
      if (!currentUser) {
        navigate('/sign-in');
        return;
      }
      const res = await fetch(`/api/comment/likeComment/${commentId}`, {
        method: 'PUT',
      });
      if (res.ok) {
        const data = await res.json();
        setComments(
          comments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  likes: data.likes,
                  numberOfLikes: data.likes.length,
                }
              : comment
          )
        );
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDelete = async (commentId) => {
    setShowModal(false);
    try {
      if (!currentUser) {
        navigate('/sign-in');
        return;
      }
      const res = await fetch(`/api/comment/deleteComment/${commentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        setComments(comments.filter((comment) => comment._id !== commentId));
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleChange = (value) => {
    setComment(value);
  };

    return (
        <div className='max-w-2xl mx-auto w-full'>
            {currentUser && (
            <form onSubmit={handleSubmit} className=''>
                <div className=''>
                    <div>
                        <h1 className='font-semibold pb-3' ref={h1Ref}>Indicaciones: </h1>
                    </div>
                    <div>
                        <p ref={el => pRefs.current[0] = el}>- DIETA RICA EN FIBRA, 30 GR. </p>
                    </div>
                    <div>
                        <p ref={el => pRefs.current[1] = el}>- LÍQUIDOS 2 – 2.5 LITROS. </p>
                    </div>
                    <div>
                        <p ref={el => pRefs.current[2] = el}>- LAVAR CON AGUA Y JABÓN HIPOALERGÉNICO. </p>
                    </div>
                    <div>
                        <p ref={el => pRefs.current[3] = el}>- SECAR CON SACADOR DE PELO. </p>
                    </div>
                    <div>
                        <p ref={el => pRefs.current[4] = el}>- DEJAR APÓSITO DE ALGODÓN EN CONTACTO CON EL ANO. </p>
                    </div>
                    <div>
                        <p ref={el => pRefs.current[5] = el}>- LAVAR ROPA INTERIOR CON DETERGENTE HIPOALERGENICO. </p>
                    </div>
                    <div>
                        <p ref={el => pRefs.current[6] = el}>- CICALFATE 1 VEZ POR LA NOCHE. </p>
                    </div>
                </div>
                <div className='pt-3'>
                  <h1 className='font-semibold pb-3'>Observaciones: (opcional)</h1>
                </div>
                <Textarea
                  placeholder='Escribir observaciones...'
                  type='text'
                  className=''
                  id="observaciones" 
                  name="observaciones"
                  color='success'
                  value={observaciones} // Vincular con el estado
                  onChange={(e) => setObservaciones(e.target.value)} // Manejar cambios
                />
                <div className='flex place-content-end items-center mt-5'>
                    <Button type='submit'>
                    Guardar
                    </Button>
                </div>
                {commentError && (
                    <Alert color='failure' className='mt-5'>
                    {commentError}
                    </Alert>
                )}
            </form>
            )}
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                popup
                size='md'
            >
            <Modal.Header />
                <Modal.Body>
                    <div className='text-center'>
                        <HiOutlineExclamationCircle className='h-14 w-14 text-gray-400 dark:text-gray-200 mb-4 mx-auto' />
                        <h3 className='mb-5 text-lg text-gray-500 dark:text-gray-400'>
                        Estas eliminando este archivo completamente del registro, eliminar?
                        </h3>
                        <div className='flex justify-center gap-4'>
                        <Button
                            color='failure'
                            onClick={() => handleDelete(commentToDelete)}
                        >
                            Si, eliminar
                        </Button>
                        <Button color='gray' onClick={() => setShowModal(false)}>
                            No, cancelar
                        </Button>
                        </div>
                    </div>
                </Modal.Body>
        </Modal>
        </div>
  );
}
