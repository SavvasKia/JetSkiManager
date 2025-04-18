import { useQuery } from "@tanstack/react-query";
import { JetSki, JetSkiStatus } from "@shared/schema";

export function useJetSkis() {
  const { data: jetSkis, isLoading, error } = useQuery({
    queryKey: ["/api/jetskis"],
  });

  const getJetSki = (id: number): JetSki | undefined => {
    if (!jetSkis) return undefined;
    return jetSkis.find((jetSki: JetSki) => jetSki.id === id);
  };

  const getAvailableJetSkis = (): JetSki[] => {
    if (!jetSkis) return [];
    return jetSkis.filter((jetSki: JetSki) => jetSki.status === JetSkiStatus.AVAILABLE);
  };

  const getHardlinerJetSkis = (): JetSki[] => {
    if (!jetSkis) return [];
    return jetSkis.filter((jetSki: JetSki) => jetSki.brand.toLowerCase() === 'hardliner');
  };

  const getAvailableHardlinerJetSkis = (): JetSki[] => {
    if (!jetSkis) return [];
    return jetSkis.filter(
      (jetSki: JetSki) => 
        jetSki.brand.toLowerCase() === 'hardliner' && 
        jetSki.status === JetSkiStatus.AVAILABLE
    );
  };

  const getJetSkisByStatus = (status: JetSkiStatusType): JetSki[] => {
    if (!jetSkis) return [];
    return jetSkis.filter((jetSki: JetSki) => jetSki.status === status);
  };

  return {
    jetSkis,
    isLoading,
    error,
    getJetSki,
    getAvailableJetSkis,
    getHardlinerJetSkis,
    getAvailableHardlinerJetSkis,
    getJetSkisByStatus
  };
}
