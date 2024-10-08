const isSnowflake = (id: string): boolean => {
  return /^\d+$/.test(id);
};

export default isSnowflake;
