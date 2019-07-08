OUTPUT="$(npm root -g)"
COMMAND="$OUTPUT/magicpad"
echo $COMMAND
npm start --prefix $COMMAND
