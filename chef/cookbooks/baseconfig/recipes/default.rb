# Make sure the Apt package lists are up to date, so we're downloading versions that exist.
cookbook_file "apt-sources.list" do
  path "/etc/apt/sources.list"
end
execute 'apt_update' do
  command 'apt-get update'
end

# Base configuration recipe in Chef.
package "wget"
package "ntp"
cookbook_file "ntp.conf" do
  path "/etc/ntp.conf"
end
execute 'ntp_restart' do
  command 'service ntp restart'
end

execute 'get newest nodejs' do
  command 'curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -'
end

execute 'install nodejs' do
  command 'apt-get install -y nodejs'
end

execute 'install build-essential' do
  command 'apt-get install -y build-essential'
end

execute 'global packages' do
  command 'npm i -g prisma graphql-cli create-react-app'
end

execute 'resolve global ajv dependency' do
  command 'npx install-peerdeps ajv-keywords'
  cwd '/usr/lib/node_modules/prisma/node_modules/table'
end

execute 'server npm packages' do
  command 'npm install'
  cwd '/home/vagrant/project/server'
end

execute 'project npm packages' do
  command 'npm install'
  cwd '/home/vagrant/project'
end

execute 'resolve project ajv dependency' do
  command 'npx install-peerdeps ajv-keywords'
  cwd '/home/vagrant/project'
end

execute 'prisma deploy' do
  command 'prisma deploy'
  cwd '/home/vagrant/project/server'
end

execute 'graphql server' do
  command 'npm start > /dev/null &'
  cwd '/home/vagrant/project/server'
end

execute 'apollo server' do
  command 'npm start > /dev/null &'
  cwd '/home/vagrant/project'
end
