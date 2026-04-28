import TournamentViewer from './components/TournamentViewer';

export default async function LivePage({ params }) {
  const { slug } = await params;
  return <TournamentViewer slug={slug} />;
}
