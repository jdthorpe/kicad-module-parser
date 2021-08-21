# These projecs were mostly fount at:
# https://kitspace.org/
# https://www.kicad.org/made-with-kicad/

cat repos.txt | while read url 
do
    # extract the repo name
    repo=$(echo $url | awk '{gsub(/^.*\.com\//,"")}1')
    # clone the repo
    git clone $url $repo
    # delelete everythinb but the pcb files
    find $repo -type f -not -name \*.kicad_pcb -delete
done
find . -type d -empty -delete
find . -type l -delete

curl https://kicad-info.s3.dualstack.us-west-2.amazonaws.com/original/3X/6/2/62321126c3a3ec48ac36e1f0c85cf93333978642.zip --output seths_test_board.zip
unzip Seths_test_board.zip -d seths_test_board