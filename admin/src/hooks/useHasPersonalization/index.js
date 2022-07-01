import { useSelector } from 'react-redux';
import get from 'lodash/get';

const selectContentManagerListViewPluginOptions = state =>
  state['content-manager_listView'].contentType.pluginOptions;

const useHasPersonalization = () => {
  const pluginOptions = useSelector(selectContentManagerListViewPluginOptions);

  return get(pluginOptions, 'personalization.personalized', false);
};

export default useHasPersonalization;
