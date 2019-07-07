pushd $(dirname "${0}") > /dev/null
basedir=$(pwd -L)
popd > /dev/null
npm start --prefix ${basedir}
