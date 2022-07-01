/**
 *
 * Initializer
 *
 */

import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import pluginId from '../../pluginId';
import useVariations from '../../hooks/useVariations';

const Initializer = ({ setPlugin }) => {
  const { isLoading, variations } = useVariations();
  const ref = useRef();

  ref.current = setPlugin;

  useEffect(() => {
    if (!isLoading && variations.length > 0) {
      ref.current(pluginId);
    }
  }, [isLoading, variations]);

  return null;
};

Initializer.propTypes = {
  setPlugin: PropTypes.func.isRequired,
};

export default Initializer;
