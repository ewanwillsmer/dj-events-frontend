import Layout from "@/components/Layout";
import { useRouter } from "next/router";
import { API_URL } from "@/config/index";
import EventItem from "@/components/EventItem";
import Link from "next/link";

export default function SearchPage({ events }) {
  const router = useRouter();
  return (
    <Layout title="Search Results">
      <Link href="/events">
        <a> {"<"}Go Back</a>
      </Link>
      <h1>Search Results for {router.query.term}</h1>
      {events.length === 0 && <h3>No events to show</h3>}

      {events.map((evt) => (
        <EventItem key={evt.id} evt={evt} />
      ))}
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const term = Object.keys(context.query)[0];
  const qs = require("qs");
  const query = qs.stringify({
    filters: {
      $or: [
        {
          name: {
            $containsi: term,
          },
        },
        {
          performers: {
            $containsi: term,
          },
        },
        {
          description: {
            $containsi: term,
          },
        },
        {
          venue: {
            $containsi: term,
          },
        },
      ],
    },
  });

  const res = await fetch(`${API_URL}/api/events?${query}&populate=*`);
  const json = await res.json();
  const events = json.data;

  return {
    props: { events },
  };
}
