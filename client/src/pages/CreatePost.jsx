import { Alert, Button, Select, TextInput } from 'flowbite-react';
import 'react-quill/dist/quill.snow.css';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useState } from 'react';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate } from 'react-router-dom';
import DashSidebar from '../components/DashSidebar';
import { Link } from 'react-router-dom';
import { IoArrowBackOutline } from 'react-icons/io5';
import './Receta/receta.css';
import "react-datepicker/dist/react-datepicker.css";

export default function CreatePost() {
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);
  const [imageUploadError, setImageUploadError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    contenido: '',
    category: '',
    celular: '',
    celularemergencia: '',
    email: '',
    edad: '',
    direccion: '',
    sanguineo: '',
    content: ''
  });
  const [publishError, setPublishError] = useState(null);
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const navigate = useNavigate();

  const handleUploadImage = async () => {
    try {
      if (!file) {
        setImageUploadError('Please select an image');
        return;
      }
      setImageUploadError(null);
      const storage = getStorage(app);
      const fileName = new Date().getTime() + '-' + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress.toFixed(0));
        },
        (error) => {
          setImageUploadError('Image upload failed');
          setImageUploadProgress(null);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImageUploadProgress(null);
            setImageUploadError(null);
            setFormData({ ...formData, image: downloadURL });
          });
        }
      );
    } catch (error) {
      setImageUploadError('Image upload failed');
      setImageUploadProgress(null);
      console.log(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/post/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }

      if (res.ok) {
        setPublishError(null);
        navigate(`/post/${data.slug}`);
      }
    } catch (error) {
      setPublishError('Something went wrong');
    }
  };

  return (
    <div className='createView'>
      <div className='flex flex-col md:flex-row'>
        <div className='md:w-56'>
          <DashSidebar />
        </div>
        <div className="flex gap-4 p-2 max-h-14">
          <Link
            to="/dashboard?tab=posts"
            className="rounded-lg py-3 px-4 text-white bg-teal-600 hover:bg-teal-800"
          >
            <IoArrowBackOutline />
          </Link>
        </div>
        <div className='p-3 max-w-3xl mx-auto min-h-screen pr-20'>
          <h1 className='text-center text-3xl my-7 font-semibold'>CREAR PACIENTE</h1>
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <div className='flex flex-col gap-4 sm:flex-row justify-between'>
              <TextInput
                type='text'
                placeholder='RUT'
                required
                id='title'
                className='flex-1'
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
              <TextInput
                type='text'
                placeholder='Nombre Completo'
                required
                id='contenido'
                className='flex-1'
                onChange={(e) =>
                  setFormData({ ...formData, contenido: e.target.value })
                }
              />
              <Select
                required
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value='uncategorized'>Genero</option>
                <option value='Masculino'>Masculino</option>
                <option value='Femenino'>Femenino</option>
                <option value='Otro'>Otro</option>
              </Select>
            </div>
            <div className='flex flex-col gap-4 sm:flex-row justify-between'>
              <TextInput
                type='number'
                placeholder='Celular'
                // required
                id='celular'
                className='flex-1'
                onChange={(e) =>
                  setFormData({ ...formData, celular: e.target.value })
                }
              />
              <TextInput
                type='number'
                placeholder='Celular Emergencia'
                // required
                id='celularemergencia'
                className='flex-1'
                onChange={(e) =>
                  setFormData({ ...formData, celularemergencia: e.target.value })
                }
              />
            </div>
            <div className='flex flex-col gap-4 sm:flex-row justify-between'>
              <TextInput
                type='text'
                placeholder='Email'
                // required
                id='email'
                className='flex-1 pt-7'
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <div className=''>
                <label className='flex text-sm pb-2'>Fecha de Nacimiento</label>
                <TextInput
                type='date'
                placeholder='dd/mm/aaaa'
                required
                id='edad'
                className='flex-1'
                onChange={(e) =>
                  setFormData({ ...formData, edad: e.target.value })
                }
                />
              </div>
            </div>  
            <div className='flex flex-col gap-4 sm:flex-row justify-between'>
              <TextInput
                type='text'
                placeholder='Direccion'
                // required
                id='direccion'
                className='flex-1'
                onChange={(e) =>
                  setFormData({ ...formData, direccion: e.target.value })
                }
              />
              <Select
                required
                onChange={(e) =>
                  setFormData({ ...formData, sanguineo: e.target.value })
                }
              >
                <option value='uncategorized'>Sanguineo</option>
                <option value='A+'>A+</option>
                <option value='A-'>A-</option>
                <option value='B+'>B+</option>
                <option value='B-'>B-</option>
                <option value='AB+'>AB+</option>
                <option value='AB-'>AB-</option>
                <option value='O+'>O+</option>
                <option value='O-'>O-</option>
              </Select>
            </div>
            <h2>Informacion adicional del paciente</h2>
            <TextInput
              type='text'
              placeholder='Alergias, patologias, etc'
              id='content'
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
            />
            <Button type='submit'>
              Guardar 
            </Button>
            {publishError && (
              <Alert className='mt-5' color='failure'>
                {publishError}
              </Alert>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
