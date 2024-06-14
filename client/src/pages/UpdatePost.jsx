import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useEffect, useState } from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import DashSidebar from '../components/DashSidebar';
import { Link } from 'react-router-dom';
import { IoArrowBackOutline } from 'react-icons/io5';
import DatePicker, {registerLocale} from "react-datepicker";
import { es } from 'date-fns/locale'
import "react-datepicker/dist/react-datepicker.css";

export default function UpdatePost() {
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
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { postId } = useParams();

  const navigate = useNavigate();
    const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    try {
      const fetchPost = async () => {
        const res = await fetch(`/api/post/getposts?postId=${postId}`);
        const data = await res.json();
        if (!res.ok) {
          console.log(data.message);
          setPublishError(data.message);
          return;
        }
        if (res.ok) {
          setPublishError(null);
          setFormData(data.posts[0]);
        }
      };

      fetchPost();
    } catch (error) {
      console.log(error.message);
    }
  }, [postId]);

  const handleUpdloadImage = async () => {
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
      const res = await fetch(`/api/post/updatepost/${formData._id}/${currentUser._id}`, {
        method: 'PUT',
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
      setPublishError('Algo salio mal');
    }
  };
  return (
    <div className='min-h-screen flex flex-col md:flex-row'>
      <div className='md:w-56'>
        {/* Sidebar */}
        <DashSidebar />
      </div>
      <div className="flex gap-4 p-2 max-h-14	">
        <Link
            to="/dashboard?tab=posts"
            className="rounded-lg py-3 px-4 text-white bg-teal-600 hover:bg-teal-800"
          >
            <IoArrowBackOutline />
          </Link>
      </div>
      <div className='p-3 max-w-3xl mx-auto min-h-screen'>
        <h1 className='text-center text-3xl my-7 font-semibold'>Editar Paciente</h1>
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
              value={formData.title}
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
              value={formData.contenido}
            />
            <Select
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              value={formData.category}
            >
              <option value='uncategorized'>Sexo</option>
              <option value='Masculino'>Masculino</option>
              <option value='Femenino'>Femenino</option>
              <option value='Otro'>Otro</option>
            </Select>
            
          </div>
          <div className='flex flex-col gap-4 sm:flex-row justify-between'>
            <TextInput
              type='text'
              placeholder='Celular'
              required
              id='celular'
              className='flex-1'
              onChange={(e) =>
                setFormData({ ...formData, celular: e.target.value })
              }
              value={formData.celular}
            />
                      <TextInput
              type='text'
              placeholder='Celular Emergencia'
              required
              id='celularemergencia'
              className='flex-1'
              onChange={(e) =>
                setFormData({ ...formData, celularemergencia: e.target.value })
              }
              value={formData.celularemergencia}
            />     
          </div>
          <div className='flex flex-col gap-4 sm:flex-row justify-between'>
            <TextInput
              type='text'
              placeholder='Email'
              required
              id='email'
              className='flex-1 pt-7'
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              value={formData.email}
            />
            <div className=''>
              <label className='flex text-sm pb-2'>Fecha de Nacimiento</label>
              <TextInput
              type='date'
              placeholder='dd/mm/aaaa'
              required
              id='edad'
              className='flex-1'
              value={formData.edad}
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
              required
              id='direccion'
              className='flex-1'
              onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
              value={formData.direccion}
              />
              <Select
              onChange={(e) =>
                setFormData({ ...formData, sanguineo: e.target.value })
              }
              value={formData.sanguineo}
            >
              <option value='uncategorized'>Sanguineo</option>
              <option value='A+'>A+</option>
              <option value='A-'>A-</option>
              <option value='B+'>B+</option>
              <option value='B-'>B-</option>
              <option value='AB+'>AB+</option>
              <option value='AB-'>AB-</option>
              <option value='AB+'>O+</option>
              <option value='AB-'>O-</option>
            </Select>
          </div>
          <h2>Informacion adicional del paciente</h2>
          {/* <div className='flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3'>
            <FileInput
              type='file'
              accept='image/*'
              onChange={(e) => setFile(e.target.files[0])}
            />
            <Button
              type='button'
              gradientDuoTone='purpleToBlue'
              size='sm'
              outline
              onClick={handleUpdloadImage}
              disabled={imageUploadProgress}
            >
              {imageUploadProgress ? (
                <div className='w-16 h-16'>
                  <CircularProgressbar
                    value={imageUploadProgress}
                    text={`${imageUploadProgress || 0}%`}
                  />
                </div>
              ) : (
                'Upload Image'
              )}
            </Button>
          </div>
          {imageUploadError && <Alert color='failure'>{imageUploadError}</Alert>} */}
          <TextInput
            type='text'
            placeholder='Alergias, patologias, etc'
            id='content'
            value={formData.content}            
            required
            onChange={(e) =>
              setFormData({ ...formData, content: e.target.value })
            }
          />
          <Button type='submit'>
            Guardar cambios
          </Button>
          {publishError && (
            <Alert className='mt-5' color='failure'>
              {publishError}
            </Alert>
          )}
        </form>
      </div>
    </div>
  );
}
