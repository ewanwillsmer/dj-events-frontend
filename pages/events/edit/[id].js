import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { parseCookies } from "@/helpers/index";
import Layout from "@/components/Layout";
import Modal from "@/components/Modal";
import ImageUpload from "@/components/ImageUpload";
import { API_URL } from "@/config/index";
import styles from "@/styles/Form.module.css";
import moment from "moment";
import { FaImage } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

export default function EditEventsPage({ evt, token }) {
  const { attributes } = evt;

  // Set values from the specific event's details
  const [values, setValues] = useState({
    name: attributes.name,
    performers: attributes.performers,
    venue: attributes.venue,
    address: attributes.address,
    date: attributes.date,
    time: attributes.time,
    description: attributes.description,
  });

  // Set the imagePreview default to the event's image if available else null
  const [imagePreview, setImagePreview] = useState(
    attributes.image.data
      ? attributes.image.data.attributes.formats.thumbnail.url
      : null
  );

  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validation, checks if callback is true for each element of array
    const hasEmptyFields = Object.values(values).some(
      (element) => element === ""
    );

    if (hasEmptyFields) {
      toast.error("Please fill in all fields.");
    }
    // Stores values in format the api will accept
    const data = { data: { ...values } };

    // Makes a Put request to update the event details, handles error
    // redirects to the event page
    const res = await fetch(`${API_URL}/api/events/${evt.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      if (res.status === 403 || res.status === 401) {
        toast.error("Unauthorised");
        return;
      }
      toast.error("Something Went Wrong");
      return;
    } else {
      const evt = await res.json();
      router.push(`/events/${evt.slug}`);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  // If an image has been uploaded, fetches the image for the imagePreview
  const imageUploaded = async (e) => {
    const qs = require("qs");
    const query = qs.stringify({
      filters: {
        id: {
          $eq: evt.id,
        },
      },
    });
    const res = await fetch(`${API_URL}/api/events?${query}&populate=*`);
    const json = await res.json();
    const event = json.data[0];
    setImagePreview(
      event.attributes.image.data.attributes.formats.thumbnail.url
    );
    setShowModal(false);
  };

  const router = useRouter();

  return (
    <Layout title="Edit Event">
      <Link href="/events">
        <a> {"<"}Go Back</a>
      </Link>
      <h1>Edit Event</h1>
      <ToastContainer />

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div>
            <label htmlFor="name">Event Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={values.name}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="performers">Performers</label>
            <input
              type="text"
              name="performers"
              id="performers"
              value={values.performers}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="venue">Venue</label>
            <input
              type="text"
              name="venue"
              id="venue"
              value={values.venue}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="address">Address</label>
            <input
              type="text"
              name="address"
              id="address"
              value={values.address}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="date">Date</label>
            <input
              type="date"
              name="date"
              id="date"
              value={moment(values.date).format("yyyy-MM-DD")}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label htmlFor="time">Time</label>
            <input
              type="text"
              name="time"
              id="time"
              value={values.time}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description">Event Description</label>
          <textarea
            type="text"
            name="description"
            id="description"
            value={values.description}
            onChange={handleInputChange}
          ></textarea>
        </div>

        <input type="submit" value="Edit Event" className="btn" />
      </form>
      <h2>Event Image</h2>
      {imagePreview ? (
        <Image src={imagePreview} height={100} width={170} alt="Event Image" />
      ) : (
        <div>
          <p>No image uploaded.</p>
        </div>
      )}
      <div>
        <button className="btn-secondary" onClick={() => setShowModal(true)}>
          <FaImage /> Set Image
        </button>
      </div>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <ImageUpload
          evtId={evt.id}
          imageUploaded={imageUploaded}
          token={token}
        />
      </Modal>
    </Layout>
  );
}

// retrieves the event information that we need to fill the form values
export async function getServerSideProps({ params: { id }, req }) {
  const { token } = parseCookies(req);

  const qs = require("qs");
  const query = qs.stringify({
    filters: {
      id: {
        $eq: id,
      },
    },
  });
  const res = await fetch(`${API_URL}/api/events?${query}&populate=*`);
  const json = await res.json();
  const evt = json.data[0];

  return {
    props: {
      evt,
      token,
    },
  };
}
