import { axiosInstance } from "../../utils";

const useGetExistingVariation = async (slug, locale, variation) => {
  const requestURL = `/content-manager/collection-types/${slug}?locale=${locale}&variation=${variation}`;

  try {
    const { data: response } = await axiosInstance.get(requestURL);
    return response;
  } catch (err) {
    return null;
  }
};

export default useGetExistingVariation;
